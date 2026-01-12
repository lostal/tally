import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './onboarding-wizard';

/**
 * Onboarding Page
 *
 * Multi-step wizard for new restaurant setup.
 * Only accessible to authenticated users without a restaurant.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/register');
  }

  // Check if user already has a restaurant
  const { data: userData } = await supabase
    .from('users')
    .select('restaurant_id')
    .eq('auth_id', user.id)
    .single();

  if (userData?.restaurant_id) {
    // Already has restaurant, go to dashboard
    redirect('/admin');
  }

  return <OnboardingWizard userId={user.id} userEmail={user.email || ''} />;
}
