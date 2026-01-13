'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CreditCard, Smartphone, Lock, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSmooth, springBouncy } from '@/lib/motion';

import { PaymentSummaryPremium } from '@/components/payment/payment-summary-premium';
import { IconButton } from '@/components/shared/motion-primitives';
import { useParticipantStore, useUIStore } from '@/stores';

type PaymentStep = 'method' | 'processing' | 'success';

interface PaymentMethod {
  id: 'apple' | 'card';
  name: string;
  description: string;
  icon: typeof CreditCard;
  iconBg: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'apple',
    name: 'Apple Pay',
    description: 'Rápido y seguro',
    icon: Smartphone,
    iconBg: 'bg-black text-white',
  },
  {
    id: 'card',
    name: 'Tarjeta',
    description: 'Débito o crédito',
    icon: CreditCard,
    iconBg: 'bg-secondary',
  },
];

/**
 * PaymentPagePremium - Elevated payment experience
 *
 * Features:
 * - Premium method selection
 * - Elegant processing animation
 * - Smooth transitions between states
 */
export default function PaymentPagePremium() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const tableNumber = searchParams.get('table') || '1';

  const { tipPercentage, selectedItemIds, claimedQuantities, fixedAmountCents, splitMethod } =
    useParticipantStore();
  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const [paymentStep, setPaymentStep] = React.useState<PaymentStep>('method');
  const [selectedMethod, setSelectedMethod] = React.useState<'card' | 'apple'>('apple');

  // Calculate amounts
  const subtotalCents = React.useMemo(() => {
    if (splitMethod === 'BY_AMOUNT') {
      return fixedAmountCents;
    }
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

    setPaymentStep('success');
    setCurrentStep('success');

    setTimeout(() => {
      router.push(`/${slug}/payment/success?table=${tableNumber}`);
    }, 800);
  };

  React.useEffect(() => {
    setCurrentStep('payment');
  }, [setCurrentStep]);

  return (
    <main className="bg-background min-h-dvh">
      {/* Header */}
      <motion.header
        className="border-border/50 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springSmooth}
      >
        <div className="container-app flex items-center justify-between py-4">
          <IconButton
            onClick={() => router.back()}
            variant="ghost"
            size="md"
            className="-ml-2"
            disabled={paymentStep !== 'method'}
          >
            <ChevronLeft className="size-6" />
          </IconButton>

          <motion.h1
            className="text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Confirmar pago
          </motion.h1>

          <div className="w-11" />
        </div>
      </motion.header>

      {/* Content */}
      <div className="container-app py-6">
        <AnimatePresence mode="wait">
          {/* Method Selection */}
          {paymentStep === 'method' && (
            <motion.div
              key="method"
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={springSmooth}
            >
              {/* Payment Summary */}
              <PaymentSummaryPremium
                subtotalCents={subtotalCents}
                tipCents={tipCents}
                tipPercentage={tipPercentage}
                totalCents={totalCents}
              />

              {/* Payment Methods */}
              <div className="space-y-4">
                <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Método de pago
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method, index) => {
                    const isSelected = selectedMethod === method.id;
                    const Icon = method.icon;

                    return (
                      <motion.button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          'flex w-full items-center gap-4 p-4',
                          'rounded-2xl border-2 text-left',
                          'transition-colors duration-200',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div
                          className={cn(
                            'flex size-12 items-center justify-center rounded-xl',
                            method.iconBg
                          )}
                        >
                          <Icon className="size-6" />
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-muted-foreground text-sm">{method.description}</p>
                        </div>

                        {/* Selection indicator */}
                        <div
                          className={cn(
                            'flex size-6 items-center justify-center rounded-full border-2',
                            isSelected ? 'border-primary bg-primary' : 'border-border'
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={springBouncy}
                            >
                              <Check className="text-primary-foreground size-3" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Security badge */}
              <motion.div
                className="text-muted-foreground flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Lock className="size-4" />
                <span className="text-xs">Pago seguro con cifrado SSL</span>
              </motion.div>

              {/* Pay Button */}
              <motion.button
                onClick={handlePay}
                className={cn(
                  'relative w-full overflow-hidden',
                  'flex items-center justify-center gap-3',
                  'h-16 rounded-2xl',
                  'bg-primary text-primary-foreground',
                  'text-lg font-semibold',
                  'shadow-primary/25 shadow-lg'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <span>Pagar €{(totalCents / 100).toFixed(2)}</span>
              </motion.button>
            </motion.div>
          )}

          {/* Processing State */}
          {paymentStep === 'processing' && (
            <motion.div
              key="processing"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
            >
              {/* Animated rings */}
              <div className="relative size-32">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="border-primary/30 absolute inset-0 rounded-full border-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [0.8, 1.5],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* Center spinner */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="border-primary/20 border-t-primary size-16 rounded-full border-4" />
                </motion.div>
              </div>

              <motion.p
                className="mt-8 text-xl font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Procesando pago...
              </motion.p>

              <motion.p
                className="text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                No cierres esta página
              </motion.p>
            </motion.div>
          )}

          {/* Success State (brief) */}
          {paymentStep === 'success' && (
            <motion.div
              key="success"
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springBouncy}
            >
              <motion.div
                className="flex size-24 items-center justify-center rounded-full bg-emerald-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springBouncy, delay: 0.1 }}
              >
                <Check className="size-12 text-white" strokeWidth={3} />
              </motion.div>

              <motion.p
                className="mt-6 text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                ¡Pago completado!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
