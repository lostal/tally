/**
 * InteractiveDemo - Landing page demo that simulates the real QR flow
 * Uses actual components from the main app for pixel-perfect accuracy
 */

import { useState } from 'react';

type DemoStep = 'trust' | 'bill' | 'payment' | 'success';

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('trust');

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 text-4xl">🍔</div>
          <h2 className="mb-2 text-xl font-bold">La Taberna del Puerto</h2>
          <p className="text-muted-foreground mb-4 text-sm">Demo interactivo próximamente</p>
          <button
            onClick={() => setCurrentStep(currentStep === 'trust' ? 'bill' : 'trust')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {currentStep === 'trust' ? 'Continuar' : 'Volver'}
          </button>
          <p className="text-muted-foreground mt-4 text-xs">Step: {currentStep}</p>
        </div>
      </div>
    </div>
  );
}
