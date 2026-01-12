import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function KDSLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/pos/login');
  }

  return <div className="bg-background min-h-dvh">{children}</div>;
}
