import { redirect } from 'next/navigation';

/**
 * Hub Register Redirect
 *
 * Redirects to the register page.
 * This exists because auth redirects might land here.
 */
export default function HubRegisterRedirect() {
  // In production this would be a proper domain redirect
  // For now, redirect to the register page
  redirect('/register');
}
