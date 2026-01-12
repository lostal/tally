import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Terminal, CreditCard, Paintbrush } from 'lucide-react';

/**
 * Navigation Hub
 *
 * Central access point for the application.
 * Serves as a temporary landing page during development/beta.
 */
export default function HomePage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="font-serif text-5xl tracking-tight">tally</h1>
          <p className="text-muted-foreground text-lg">
            Sistema operativo para restaurantes modernos.
          </p>
        </div>

        {/* Access Nodes */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <Link href="/admin/login" className="group">
              <div className="bg-card hover:border-primary/50 flex items-center justify-between rounded-2xl border-2 p-5 transition-all group-hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex size-12 items-center justify-center rounded-xl transition-colors">
                    <LayoutDashboard className="size-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Panel de Control</div>
                    <div className="text-muted-foreground text-sm">Para dueños y managers</div>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary size-5 transition-colors" />
              </div>
            </Link>

            <Link href="/pos/login" className="group">
              <div className="bg-card hover:border-primary/50 flex items-center justify-between rounded-2xl border-2 p-5 transition-all group-hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex size-12 items-center justify-center rounded-xl transition-colors">
                    <Terminal className="size-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Punto de Venta (POS)</div>
                    <div className="text-muted-foreground text-sm">Para camareros y staff</div>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary size-5 transition-colors" />
              </div>
            </Link>
          </div>

          <div className="pt-2">
            <Link href="/register">
              <Button size="lg" className="h-14 w-full rounded-xl text-base" variant="outline">
                Registrar nuevo restaurante
              </Button>
            </Link>
          </div>
        </div>

        {/* Dev Tools (Hidden in prod ideally, helpful for now) */}
        <div className="border-t pt-8">
          <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
            Herramientas de Desarrollo
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/design-system"
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors"
            >
              <Paintbrush className="size-4" />
              <span>Design System</span>
            </Link>
            <Link
              href="/pricing"
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors"
            >
              <CreditCard className="size-4" />
              <span>Pricing Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
