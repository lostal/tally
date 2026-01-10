'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentSummary, PaymentButton, ApplePayButton } from '@/components/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared';
import { useParticipantStore, useUIStore } from '@/stores';
import { DEMO_RESTAURANTS } from '@/components/providers/theme-provider';
import { ChevronLeft, CreditCard, Smartphone } from 'lucide-react';

type PaymentStep = 'summary' | 'processing' | 'complete';

/**
 * Payment Page
 *
 * Final payment confirmation and processing.
 */
export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { tipPercentage, selectedItemIds, claimedQuantities, fixedAmountCents, splitMethod } =
    useParticipantStore();
  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const [paymentStep, setPaymentStep] = React.useState<PaymentStep>('summary');
  const [selectedMethod, setSelectedMethod] = React.useState<'card' | 'apple'>('card');

  // Calculate amounts (using participant store values)
  const subtotalCents = React.useMemo(() => {
    if (splitMethod === 'BY_AMOUNT') {
      return fixedAmountCents;
    }
    // Demo: calculate from selected items
    const prices: Record<string, number> = {
      '1': 1450,
      '2': 1600,
      '3': 850,
      '4': 400,
      '5': 300,
    };
    return selectedItemIds.reduce((total, id) => {
      const qty = claimedQuantities[id] || 1;
      return total + (prices[id] || 0) * qty;
    }, 0);
  }, [splitMethod, fixedAmountCents, selectedItemIds, claimedQuantities]);

  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;

  const handlePay = async () => {
    setPaymentStep('processing');

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setPaymentStep('complete');
    setCurrentStep('success');

    // Redirect to success
    setTimeout(() => {
      router.push(`/${slug}/payment/success`);
    }, 500);
  };

  React.useEffect(() => {
    setCurrentStep('payment');
  }, [setCurrentStep]);

  return (
    <main className="bg-background min-h-dvh">
      {/* Header */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
        <div className="container-app py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              disabled={paymentStep !== 'summary'}
              className="-ml-2"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-sm font-semibold">Confirmar pago</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container-app py-6">
        <AnimatePresence mode="wait">
          {paymentStep === 'summary' && (
            <motion.div
              key="summary"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Payment Summary */}
              <PaymentSummary
                subtotalCents={subtotalCents}
                tipCents={tipCents}
                tipPercentage={tipPercentage}
                totalCents={totalCents}
              />

              {/* Payment Method Selection */}
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Payment method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={() => setSelectedMethod('apple')}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                      selectedMethod === 'apple'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-black text-white">
                        <Smartphone className="size-5" />
                      </div>
                      <div>
                        <div className="font-medium">Apple Pay</div>
                        <div className="text-muted-foreground text-sm">Quick & secure</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
                      selectedMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary flex size-10 items-center justify-center rounded-lg">
                        <CreditCard className="size-5" />
                      </div>
                      <div>
                        <div className="font-medium">Credit / Debit Card</div>
                        <div className="text-muted-foreground text-sm">Visa, Mastercard, Amex</div>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Pay Button */}
              <div className="space-y-4">
                {selectedMethod === 'apple' ? (
                  <ApplePayButton onClick={handlePay} />
                ) : (
                  <PaymentButton amountCents={totalCents} onClick={handlePay} />
                )}

                <p className="text-muted-foreground text-center text-xs">
                  Secure payment powered by Stripe
                </p>
              </div>
            </motion.div>
          )}

          {paymentStep === 'processing' && (
            <motion.div
              key="processing"
              className="flex min-h-[50vh] flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-lg font-medium">Processing payment...</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Please don&apos;t close this page
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
