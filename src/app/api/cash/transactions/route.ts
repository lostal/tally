import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { validateBody, notFound } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { addTransactionSchema } from '@/types/cash';
import type { CashTransaction } from '@/types/cash';

// Type alias for untyped Supabase client
type UntypedClient = ReturnType<typeof createAdminClient>;

/**
 * POST /api/cash/transactions
 *
 * Add a cash entry or exit to the current open register.
 */
export async function POST(request: NextRequest) {
  // 1. Verify authentication (manager/owner only)
  const {
    restaurantId,
    userId,
    error: authError,
  } = await verifyApiAuthWithRole(request, 'settings:manage');
  if (authError) return authError;

  // 2. Validate body
  const { data, error: validationError } = await validateBody(request, addTransactionSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient() as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // 3. Get current open register
  const { data: register } = await adminSupabase
    .from('cash_registers')
    .select('id')
    .eq('restaurant_id', restaurantId!)
    .eq('status', 'open')
    .single();

  if (!register) {
    return notFound('No open cash register found. Please open a register first.');
  }

  // 4. Create transaction
  const { data: transaction, error } = await adminSupabase
    .from('cash_transactions')
    .insert({
      register_id: (register as { id: string }).id,
      restaurant_id: restaurantId,
      user_id: userId,
      type: data.type,
      amount_cents: data.amountCents,
      reason: data.reason,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cash transaction:', error);
    return NextResponse.json({ error: 'Failed to add cash transaction' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    transaction: transaction as CashTransaction,
    message:
      data.type === 'entry'
        ? 'Cash entry recorded successfully'
        : 'Cash exit recorded successfully',
  });
}

/**
 * GET /api/cash/transactions
 *
 * Get all transactions for the current open register.
 */
export async function GET(request: NextRequest) {
  // 1. Verify authentication (manager/owner only)
  const { restaurantId, error: authError } = await verifyApiAuthWithRole(request, 'reports:view');
  if (authError) return authError;

  const adminSupabase = createAdminClient() as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // 2. Get current open register
  const { data: register } = await adminSupabase
    .from('cash_registers')
    .select('id')
    .eq('restaurant_id', restaurantId!)
    .eq('status', 'open')
    .single();

  if (!register) {
    return NextResponse.json({ transactions: [] });
  }

  // 3. Get transactions with user info
  const { data: transactions, error } = await adminSupabase
    .from('cash_transactions')
    .select(
      `
      *,
      user:users(name)
    `
    )
    .eq('register_id', (register as { id: string }).id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }

  return NextResponse.json({ transactions: transactions ?? [] });
}
