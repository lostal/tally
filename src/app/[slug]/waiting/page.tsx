'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WaitingRoom } from '@/components/waiting';
import { useParticipantStore, useUIStore } from '@/stores';

// Demo participants
const DEMO_PARTICIPANTS = [
  { id: 'me', name: 'You', isReady: false, color: 'bg-blue-500' },
  { id: 'p2', name: 'Maria', isReady: true, color: 'bg-purple-500' },
];

/**
 * Waiting Room Page
 *
 * Multi-user sync - waits for everyone to be ready.
 */
export default function WaitingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { isReady, markReady, cancelReady } = useParticipantStore();
  const setCurrentStep = useUIStore((s) => s.setCurrentStep);

  const participants = React.useMemo(
    () =>
      DEMO_PARTICIPANTS.map((p) => ({
        ...p,
        isReady: p.id === 'me' ? isReady : p.isReady,
      })),
    [isReady]
  );

  const handleCountdownComplete = () => {
    setCurrentStep('payment');
    router.push(`/${slug}/payment`);
  };

  React.useEffect(() => {
    setCurrentStep('waiting');
  }, [setCurrentStep]);

  return (
    <main className="bg-background min-h-dvh">
      <div className="container-app py-8">
        <WaitingRoom
          participants={participants}
          currentUserId="me"
          isCurrentUserReady={isReady}
          onMarkReady={markReady}
          onCancelReady={cancelReady}
          onCountdownComplete={handleCountdownComplete}
        />
      </div>
    </main>
  );
}
