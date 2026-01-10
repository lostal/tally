'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuccessReceipt } from '@/components/payment';
import { useParticipantStore } from '@/stores';

/**
 * Payment Success Page
 *
 * Shows receipt and celebration animation.
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { selectedItemIds, claimedQuantities, tipPercentage, reset } = useParticipantStore();

  // Calculate values
  const prices: Record<string, { name: string; price: number }> = {
    '1': { name: 'Margherita Pizza', price: 1450 },
    '2': { name: 'Pasta Carbonara', price: 1600 },
    '3': { name: 'Tiramisu', price: 850 },
    '4': { name: 'Sparkling Water', price: 400 },
    '5': { name: 'Espresso', price: 300 },
  };

  const items = selectedItemIds.map((id) => {
    const item = prices[id];
    const qty = claimedQuantities[id] || 1;
    return {
      name: item?.name || 'Item',
      quantity: qty,
      amountCents: (item?.price || 0) * qty,
    };
  });

  const subtotalCents = items.reduce((sum, i) => sum + i.amountCents, 0);
  const tipCents = Math.round((subtotalCents * tipPercentage) / 100);
  const totalCents = subtotalCents + tipCents;

  const handleDone = () => {
    reset();
    router.push(`/${slug}`);
  };

  // Fallback if no items (direct navigation)
  if (items.length === 0) {
    return (
      <main className="bg-background min-h-dvh">
        <div className="container-app py-8">
          <SuccessReceipt
            restaurantName="Demo Restaurant"
            tableNumber="7"
            receiptNumber="RCP-001"
            items={[{ name: 'Sample Item', quantity: 1, amountCents: 1000 }]}
            subtotalCents={1000}
            tipCents={100}
            totalCents={1100}
            paidAt={new Date()}
            onDone={handleDone}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background min-h-dvh">
      <div className="container-app py-8">
        <SuccessReceipt
          restaurantName="Trattoria Mario"
          tableNumber="7"
          receiptNumber={`RCP-${Date.now().toString(36).toUpperCase()}`}
          items={items}
          subtotalCents={subtotalCents}
          tipCents={tipCents}
          totalCents={totalCents}
          paidAt={new Date()}
          onDone={handleDone}
        />
      </div>
    </main>
  );
}
