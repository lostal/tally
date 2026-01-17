'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Table2,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menú' },
  { href: '/admin/tables', icon: Table2, label: 'Mesas' },
  { href: '/admin/settings', icon: Settings, label: 'Ajustes' },
];

/**
 * Admin Shell Layout (Client Component)
 * Handles sidebar, navigation state, and logout
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="bg-background min-h-dvh">
      {/* Mobile header */}
      <header className="border-border bg-background/95 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3">
          <ChefHat className="text-primary size-6" />
          <span className="font-semibold">tally admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background border-border fixed top-0 left-0 z-40 h-full w-64 border-r transition-transform duration-200',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <ChefHat className="text-primary size-6" />
          <span className="text-lg font-semibold">tally admin</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute right-0 bottom-0 left-0 border-t p-4">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="size-5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          className="bg-background/80 fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="min-h-dvh p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
