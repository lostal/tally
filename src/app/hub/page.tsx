import { redirect } from 'next/navigation';

export default function HubRootRedirect() {
  redirect('/admin');
}
