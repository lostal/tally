'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table2, ClipboardList, LogOut, ChefHat } from 'lucide-react';

interface POSLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/pos', icon: Table2, label: 'Mesas' },
  { href: '/pos/orders', icon: ClipboardList, label: 'Pedidos' },
];

export default function POSLayout({ children }: POSLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show layout on login page
  if (pathname === '/pos/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
    router.push('/pos/login');
    router.refresh();
  };

  return (
    <div className="bg-background min-h-dvh">
      {/* Top bar */}
      <header className="border-border bg-background fixed top-0 right-0 left-0 z-50 flex h-auto items-center justify-between border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <ChefHat className="text-primary size-7" />
          <span className="text-lg font-semibold">tally POS</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/pos' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="size-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="pt-20">
        <div className="min-h-[calc(100dvh-5rem)] px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
