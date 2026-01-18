import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';
import { CashContent } from './cash-content';
import type { ZReport } from '@/types/cash';

export const dynamic = 'force-dynamic';

// Type aliases for untyped tables
type UntypedClient = ReturnType<typeof createAdminClient>;

interface RegisterRow {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opening_amount_cents: number;
  expected_cash_cents: number | null;
  actual_cash_cents: number | null;
  difference_cents: number | null;
  z_report: ZReport | null;
  openedByUser?: { name: string } | null;
  closedByUser?: { name: string } | null;
}

interface TransactionRow {
  id: string;
  type: 'entry' | 'exit';
  amount_cents: number;
  reason: string;
  notes: string | null;
  created_at: string;
  user: { name: string } | null;
}

export default async function CashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/hub/auth/login');
  }

  // Get user role and restaurant
  const adminSupabase = createAdminClient();
  const { data: userData } = await adminSupabase
    .from('users')
    .select('restaurant_id, role')
    .eq('auth_id', user.id)
    .single();

  if (!userData?.restaurant_id) {
    redirect('/hub/onboarding');
  }

  // Only manager/owner can access cash management
  if (userData.role !== 'owner' && userData.role !== 'manager') {
    redirect('/hub/admin');
  }

  // Use untyped client for new tables
  const untypedSupabase = adminSupabase as unknown as {
    from: (table: string) => ReturnType<UntypedClient['from']>;
  };

  // Get current open register if any
  const { data: register } = await untypedSupabase
    .from('cash_registers')
    .select(
      `
      *,
      openedByUser:users!opened_by(name)
    `
    )
    .eq('restaurant_id', userData.restaurant_id)
    .eq('status', 'open')
    .single();

  // Get transactions for current register
  let transactions: TransactionRow[] = [];

  if (register) {
    const { data: txData } = await untypedSupabase
      .from('cash_transactions')
      .select(
        `
        id, type, amount_cents, reason, notes, created_at,
        user:users(name)
      `
      )
      .eq('register_id', (register as RegisterRow).id)
      .order('created_at', { ascending: false });

    transactions = (txData ?? []) as TransactionRow[];
  }

  // Get recent closed registers (last 7 days) for history
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentRegisters } = await untypedSupabase
    .from('cash_registers')
    .select(
      `
      id, opened_at, closed_at, opening_amount_cents,
      expected_cash_cents, actual_cash_cents, difference_cents,
      z_report,
      openedByUser:users!opened_by(name),
      closedByUser:users!closed_by(name)
    `
    )
    .eq('restaurant_id', userData.restaurant_id)
    .eq('status', 'closed')
    .gte('closed_at', sevenDaysAgo.toISOString())
    .order('closed_at', { ascending: false })
    .limit(10);

  return (
    <CashContent
      currentRegister={register as RegisterRow | null}
      transactions={transactions}
      recentRegisters={(recentRegisters ?? []) as RegisterRow[]}
    />
  );
}
