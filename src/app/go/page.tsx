import { redirect } from 'next/navigation';

export default function GoRootRedirect() {
  // Redirect to main marketing site if accessing root of go subdomain
  // Use absolute URL to break out of internal rewrite
  redirect(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
}
