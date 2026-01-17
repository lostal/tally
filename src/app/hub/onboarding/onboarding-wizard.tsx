'use client';

import * as React from 'react';

import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Palette,
  UtensilsCrossed,
  LayoutGrid,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { PRICING_PLANS, type SubscriptionPlan } from '@/types';

interface OnboardingWizardProps {
  userId: string;
  userEmail: string;
}

type Step = 'business' | 'branding' | 'menu' | 'tables' | 'plan';

const STEPS: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: 'business', title: 'Negocio', icon: Building2 },
  { id: 'branding', title: 'Marca', icon: Palette },
  { id: 'menu', title: 'Menú', icon: UtensilsCrossed },
  { id: 'tables', title: 'Mesas', icon: LayoutGrid },
  { id: 'plan', title: 'Plan', icon: CreditCard },
];

interface FormData {
  // Business
  restaurantName: string;
  slug: string;
  taxId: string;
  address: string;
  // Branding
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  // Menu
  menuOption: 'empty' | 'demo' | 'import';
  // Tables
  tableCount: number;
  tableCapacity: number;
  // Plan
  selectedPlan: SubscriptionPlan;
  billingPeriod: 'monthly' | 'yearly';
}

export function OnboardingWizard({ userId, userEmail: _userEmail }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState<Step>('business');
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    restaurantName: '',
    slug: '',
    taxId: '',
    address: '',
    primaryColor: '#000000',
    accentColor: '#22c55e',
    logoUrl: '',
    menuOption: 'demo',
    tableCount: 5,
    tableCapacity: 4,
    selectedPlan: 'essential',
    billingPeriod: 'monthly',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      const nextStep = STEPS[currentStepIndex + 1].id;
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevStep = STEPS[currentStepIndex - 1].id;
      setCurrentStep(prevStep);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // 1. Create restaurant and subscription
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create restaurant');
      }

      const { restaurantId } = await response.json();

      // 2. Redirect to Stripe checkout
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          plan: formData.selectedPlan,
          billingPeriod: formData.billingPeriod,
          restaurantId,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout');
      }

      const { url } = await checkoutResponse.json();
      window.location.href = url;
    } catch (error) {
      logger.error('Onboarding error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Progress */}
      <div className="border-b px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isPast = index < currentStepIndex;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                        isActive && 'border-primary bg-primary text-primary-foreground',
                        isPast && 'border-primary bg-primary/10 text-primary',
                        !isActive && !isPast && 'border-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive && 'text-foreground',
                        !isActive && 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1',
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'business' && (
                <StepBusiness
                  formData={formData}
                  updateField={updateField}
                  generateSlug={generateSlug}
                />
              )}
              {currentStep === 'branding' && (
                <StepBranding formData={formData} updateField={updateField} />
              )}
              {currentStep === 'menu' && <StepMenu formData={formData} updateField={updateField} />}
              {currentStep === 'tables' && (
                <StepTables formData={formData} updateField={updateField} />
              )}
              {currentStep === 'plan' && <StepPlan formData={formData} updateField={updateField} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t px-4 py-4">
        <div className="mx-auto flex max-w-xl justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={isFirstStep || isLoading}>
            <ChevronLeft className="mr-2 size-4" />
            Anterior
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : isLastStep ? (
              'Completar'
            ) : (
              <>
                Siguiente
                <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function StepBusiness({
  formData,
  updateField,
  generateSlug,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  generateSlug: (name: string) => string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Datos del negocio</h2>
        <p className="text-muted-foreground mt-1">Información básica de tu restaurante.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre del restaurante</label>
          <Input
            value={formData.restaurantName}
            onChange={(e) => {
              updateField('restaurantName', e.target.value);
              updateField('slug', generateSlug(e.target.value));
            }}
            placeholder="Mi Restaurante"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">URL (slug)</label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">tally.app/</span>
            <Input
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="mi-restaurante"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">NIF/CIF</label>
          <Input
            value={formData.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
            placeholder="B12345678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Dirección fiscal</label>
          <Input
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Calle Mayor 1, 28001 Madrid"
          />
        </div>
      </div>
    </div>
  );
}

function StepBranding({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Personaliza tu marca</h2>
        <p className="text-muted-foreground mt-1">Colores y logo para tu restaurante.</p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Color principal</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="size-10 cursor-pointer rounded border"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Color acento</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="size-10 cursor-pointer rounded border"
              />
              <Input
                value={formData.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">URL del logo (opcional)</label>
          <Input
            value={formData.logoUrl}
            onChange={(e) => updateField('logoUrl', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

function StepMenu({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Configura tu menú</h2>
        <p className="text-muted-foreground mt-1">¿Cómo quieres empezar?</p>
      </div>
      <div className="space-y-3">
        {[
          {
            value: 'demo',
            title: 'Menú de ejemplo',
            desc: 'Empezar con productos de demostración',
          },
          { value: 'empty', title: 'Empezar vacío', desc: 'Configuraré todo manualmente' },
          {
            value: 'import',
            title: 'Importar (próximamente)',
            desc: 'Subir CSV o conectar con otro sistema',
            disabled: true,
          },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => updateField('menuOption', option.value as FormData['menuOption'])}
            disabled={option.disabled}
            className={cn(
              'w-full rounded-xl border-2 p-4 text-left transition-colors',
              formData.menuOption === option.value && 'border-primary bg-primary/5',
              formData.menuOption !== option.value && 'border-muted hover:border-primary/50',
              option.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div className="font-medium">{option.title}</div>
            <div className="text-muted-foreground text-sm">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTables({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Configura tus mesas</h2>
        <p className="text-muted-foreground mt-1">Podrás añadir más después.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Número de mesas</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={formData.tableCount}
            onChange={(e) => updateField('tableCount', parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Capacidad por defecto</label>
          <Input
            type="number"
            min={1}
            max={20}
            value={formData.tableCapacity}
            onChange={(e) => updateField('tableCapacity', parseInt(e.target.value) || 4)}
          />
        </div>
      </div>
    </div>
  );
}

function StepPlan({
  formData,
  updateField,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Elige tu plan</h2>
        <p className="text-muted-foreground mt-1">14 días gratis en todos los planes.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={formData.billingPeriod === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateField('billingPeriod', 'monthly')}
        >
          Mensual
        </Button>
        <Button
          variant={formData.billingPeriod === 'yearly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => updateField('billingPeriod', 'yearly')}
        >
          Anual (-17%)
        </Button>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PRICING_PLANS.map((plan) => {
          const price =
            formData.billingPeriod === 'yearly' ? plan.priceYearly / 12 : plan.priceMonthly;

          return (
            <button
              key={plan.id}
              onClick={() => updateField('selectedPlan', plan.id)}
              className={cn(
                'w-full rounded-xl border-2 p-4 text-left transition-colors',
                formData.selectedPlan === plan.id && 'border-primary bg-primary/5',
                formData.selectedPlan !== plan.id && 'border-muted hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {plan.features.slice(0, 2).join(' · ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-xl">€{(price / 100).toFixed(0)}</div>
                  <div className="text-muted-foreground text-xs">/mes</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
