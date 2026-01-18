import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, notFound } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { createAuditLog, getClientIp, ResourceTypes } from '@/lib/auth/audit';
import { closeRegisterSchema } from '@/types/cash';
import type { CashRegister, ZReport } from '@/types/cash';

// Type alias for untyped Supabase client
type UntypedClient = ReturnType<typeof createAdminClient>;

interface RegisterRow {
  id: string;
  opening_amount_cents: number;
  opened_at: string;
}

interface TransactionRow {
  type: 'entry' | 'exit';
  amount_cents: number;
}

interface PaymentRow {
  amount_cents: number;
  tip_cents: number | null;
}

/**
 * POST /api/cash/close
 *
 * Close the current cash register and generate Z-Report.
 */
export async function POST(request: NextRequest) {
  // 1. Verify authentication (manager/owner only)
  const {
    restaurantId,
    userId,
    role,
    error: authError,
  } = await verifyApiAuthWithRole(request, 'settings:manage');
  if (authError) return authError;

  // 2. Validate body
  const { data, error: validationError } = await validateBody(request, closeRegisterSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient() as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // 3. Get current open register
  const { data: registerData } = await adminSupabase
    .from('cash_registers')
    .select('id, opening_amount_cents, opened_at')
    .eq('restaurant_id', restaurantId!)
    .eq('status', 'open')
    .single();

  if (!registerData) {
    return notFound('No open cash register found');
  }

  const register = registerData as RegisterRow;

  // 4. Calculate transactions total
  const { data: transactionsData } = await adminSupabase
    .from('cash_transactions')
    .select('type, amount_cents')
    .eq('register_id', register.id);

  const transactions = (transactionsData ?? []) as TransactionRow[];

  let transactionsNet = 0;
  let entriesCount = 0;
  let entriesCents = 0;
  let exitsCount = 0;
  let exitsCents = 0;

  for (const tx of transactions) {
    if (tx.type === 'entry') {
      entriesCount++;
      entriesCents += tx.amount_cents;
      transactionsNet += tx.amount_cents;
    } else {
      exitsCount++;
      exitsCents += tx.amount_cents;
      transactionsNet -= tx.amount_cents;
    }
  }

  // 5. Calculate card sales during this period using typed client
  const typedSupabase = createAdminClient();
  const { data: salesData } = await typedSupabase
    .from('payments')
    .select('amount_cents, tip_cents')
    .eq('status', 'completed')
    .gte('completed_at', register.opened_at);

  const payments = (salesData ?? []) as PaymentRow[];

  let cardCount = 0;
  let cardTotalCents = 0;
  let tipsTotalCents = 0;

  for (const payment of payments) {
    cardCount++;
    cardTotalCents += payment.amount_cents;
    tipsTotalCents += payment.tip_cents ?? 0;
  }

  // 6. Build Z-Report
  const expectedCashCents = register.opening_amount_cents + transactionsNet;
  const differenceCents = data.actualCashCents - expectedCashCents;

  const zReport: ZReport = {
    generatedAt: new Date().toISOString(),
    period: {
      start: register.opened_at,
      end: new Date().toISOString(),
    },
    openingAmount: register.opening_amount_cents,
    sales: {
      card: { count: cardCount, totalCents: cardTotalCents },
      cash: { count: 0, totalCents: 0 }, // Cash payments not yet implemented
    },
    tips: { totalCents: tipsTotalCents },
    transactions: {
      entries: entriesCount,
      entriesCents,
      exits: exitsCount,
      exitsCents,
      netCents: transactionsNet,
    },
    totals: {
      grossSalesCents: cardTotalCents,
      tipsCents: tipsTotalCents,
    },
  };

  // 7. Close register
  const { data: closedRegister, error } = await adminSupabase
    .from('cash_registers')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      closed_by: userId,
      expected_cash_cents: expectedCashCents,
      actual_cash_cents: data.actualCashCents,
      difference_cents: differenceCents,
      z_report: zReport as unknown as Record<string, unknown>,
    })
    .eq('id', register.id)
    .select()
    .single();

  if (error) {
    console.error('Error closing cash register:', error);
    return NextResponse.json({ error: 'Failed to close cash register' }, { status: 500 });
  }

  // 8. Create audit log
  await createAuditLog({
    restaurantId: restaurantId!,
    userId: userId!,
    action: 'close_register',
    resourceType: ResourceTypes.ORDER, // Using ORDER as closest match
    resourceId: register.id,
    metadata: {
      role,
      openingAmount: register.opening_amount_cents,
      expectedCash: expectedCashCents,
      actualCash: data.actualCashCents,
      difference: differenceCents,
      cardSales: cardTotalCents,
      tips: tipsTotalCents,
    },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({
    success: true,
    register: closedRegister as CashRegister,
    zReport,
    summary: {
      expectedCashCents,
      actualCashCents: data.actualCashCents,
      differenceCents,
      cardSalesCents: cardTotalCents,
      tipsCents: tipsTotalCents,
    },
    message:
      differenceCents === 0
        ? 'Cash register closed. Balance correct!'
        : differenceCents > 0
          ? `Cash register closed. Surplus of €${(differenceCents / 100).toFixed(2)}`
          : `Cash register closed. Shortage of €${(Math.abs(differenceCents) / 100).toFixed(2)}`,
  });
}
