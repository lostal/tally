import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { validateBody } from '@/lib/api/validation';
import { verifyApiAuthWithRole } from '@/lib/auth/rbac';
import { openRegisterSchema } from '@/types/cash';
import type { CashRegister, CashRegisterWithTransactions } from '@/types/cash';

// Type alias for untyped Supabase client
type UntypedClient = ReturnType<typeof createAdminClient>;

/**
 * GET /api/cash
 *
 * Get the current open cash register for the restaurant.
 * Returns null if no register is open.
 */
export async function GET(request: NextRequest) {
  // 1. Verify authentication (manager/owner only for cash management)
  const { restaurantId, error: authError } = await verifyApiAuthWithRole(request, 'reports:view');
  if (authError) return authError;

  const adminSupabase = createAdminClient() as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // 2. Get current open register with transactions
  const { data: register, error } = await adminSupabase
    .from('cash_registers')
    .select(
      `
      *,
      transactions:cash_transactions(
        id, type, amount_cents, reason, notes, created_at,
        user:users(name)
      ),
      openedByUser:users!opened_by(name),
      closedByUser:users!closed_by(name)
    `
    )
    .eq('restaurant_id', restaurantId!)
    .eq('status', 'open')
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = "No rows returned" which is fine (no open register)
    console.error('Error fetching cash register:', error);
    return NextResponse.json({ error: 'Failed to fetch cash register' }, { status: 500 });
  }

  // 3. Calculate running totals for UI
  let runningTotal = (register as CashRegister | null)?.opening_amount_cents ?? 0;
  const typedRegister = register as CashRegisterWithTransactions | null;
  if (typedRegister?.transactions) {
    for (const tx of typedRegister.transactions as unknown as {
      type: string;
      amount_cents: number;
    }[]) {
      runningTotal += tx.type === 'entry' ? tx.amount_cents : -tx.amount_cents;
    }
  }

  return NextResponse.json({
    register: typedRegister,
    currentCashCents: runningTotal,
    hasOpenRegister: !!register,
  });
}

/**
 * POST /api/cash
 *
 * Open a new cash register shift.
 * Fails if a register is already open for this restaurant.
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
  const { data, error: validationError } = await validateBody(request, openRegisterSchema);
  if (!data) return validationError;

  const adminSupabase = createAdminClient() as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // 3. Check if a register is already open
  const { data: existingRegister } = await adminSupabase
    .from('cash_registers')
    .select('id')
    .eq('restaurant_id', restaurantId!)
    .eq('status', 'open')
    .single();

  if (existingRegister) {
    return NextResponse.json(
      {
        error: 'A cash register is already open',
        code: 'REGISTER_ALREADY_OPEN',
        registerId: (existingRegister as { id: string }).id,
      },
      { status: 400 }
    );
  }

  // 4. Create new register
  const { data: newRegister, error } = await adminSupabase
    .from('cash_registers')
    .insert({
      restaurant_id: restaurantId,
      opened_by: userId,
      opening_amount_cents: data.openingAmountCents,
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cash register:', error);
    return NextResponse.json({ error: 'Failed to open cash register' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    register: newRegister as CashRegister,
    message: 'Cash register opened successfully',
  });
}
