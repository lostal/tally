'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Check, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingSuccessPage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Success Icon */}
        <div className="bg-primary/10 text-primary mx-auto flex size-24 items-center justify-center rounded-full">
          <Check className="size-12" strokeWidth={3} />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl leading-tight">¡Todo listo!</h1>
          <p className="text-muted-foreground text-lg">
            Tu suscripción está activa y tu restaurante ha sido configurado correctamente.
          </p>
        </div>

        {/* Action */}
        <div className="pt-4">
          <Link href="/admin">
            <Button size="lg" className="group h-14 w-full rounded-xl text-base">
              Ir al Dashboard
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-muted-foreground mt-4 text-xs">
            Te hemos enviado el recibo a tu email.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
