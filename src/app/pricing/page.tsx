'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PRICING_PLANS } from '@/types';

/**
 * Pricing Page
 *
 * Public pricing information.
 * Also serves as the "Cancel" destination from Stripe Checkout.
 */
export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="bg-background min-h-dvh px-6 py-20">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <div className="space-y-6 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver
          </Link>
          <h1 className="font-serif text-4xl tracking-tight md:text-6xl">Planes transparentes</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Empieza gratis 14 días. Sin tarjeta para empezar. Cancela cuando quieras.
          </p>

          {/* Toggle */}
          <div className="flex justify-center pt-4">
            <div className="bg-muted inline-flex rounded-xl p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  'rounded-lg px-6 py-2.5 text-sm font-medium transition-all',
                  billingPeriod === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  'rounded-lg px-6 py-2.5 text-sm font-medium transition-all',
                  billingPeriod === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Anual (-17%)
              </button>
            </div>
          </div>
        </div>

        {/* Grilla de Precios */}
        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const price = billingPeriod === 'yearly' ? plan.priceYearly / 12 : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={cn(
                  'bg-card relative flex flex-col gap-8 rounded-3xl border-2 p-8',
                  plan.id === 'pro' ? 'border-primary shadow-lg' : 'border-muted'
                )}
              >
                {plan.id === 'pro' && (
                  <div className="bg-primary text-primary-foreground absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-medium tracking-wide uppercase">
                    Más popular
                  </div>
                )}

                <div>
                  <h3 className="mb-2 font-serif text-2xl">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">€{(price / 100).toFixed(0)}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                    {plan.id === 'starter' &&
                      'Ideal para cafeterías y locales pequeños que están empezando.'}
                    {plan.id === 'pro' &&
                      'Perfecto para restaurantes establecidos con alto volumen.'}
                    {plan.id === 'business' &&
                      'Para cadenas y franquicias que necesitan control total.'}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="text-primary size-5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register" className="block">
                  <Button
                    className="h-12 w-full rounded-xl text-base"
                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                  >
                    Empezar 14 días gratis
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
