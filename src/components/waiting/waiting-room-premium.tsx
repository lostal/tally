'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { springSmooth, springBouncy, springSnappy } from '@/lib/motion';
import { Clock, Check, Users, Sparkles } from 'lucide-react';

interface Participant {
  id: string;
  name?: string;
  imageUrl?: string;
  isReady: boolean;
  color?: string;
}

interface WaitingRoomPremiumProps {
  participants: Participant[];
  currentUserId: string;
  isCurrentUserReady: boolean;
  onMarkReady: () => void;
  onCancelReady: () => void;
  onCountdownComplete: () => void;
  countdownSeconds?: number;
}

// --- Progress Ring Component ---
function ProgressRing({ readyCount, totalCount }: { readyCount: number; totalCount: number }) {
  const percentage = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={springBouncy}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl transition-opacity duration-500',
          percentage === 100 ? 'bg-emerald-500/30' : 'bg-primary/20'
        )}
      />

      <svg className="relative size-36 -rotate-90" viewBox="0 0 140 140">
        {/* Background circle */}
        <circle cx="70" cy="70" r={radius} fill="none" strokeWidth="8" className="stroke-muted" />
        {/* Progress circle */}
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn(
            'transition-colors duration-300',
            percentage === 100 ? 'stroke-emerald-500' : 'stroke-primary'
          )}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={springSmooth}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className="font-serif text-4xl font-bold"
          key={readyCount}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springBouncy}
        >
          {readyCount}/{totalCount}
        </motion.span>
        <span className="text-muted-foreground text-sm">listos</span>
      </div>
    </motion.div>
  );
}

// --- Countdown Component ---
function CountdownOverlay({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [count, setCount] = React.useState(seconds);

  React.useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <motion.div
          className="relative mb-4"
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={springBouncy}
        >
          <div className="bg-primary/30 absolute inset-0 scale-150 rounded-full blur-3xl" />
          <span className="text-primary relative font-serif text-8xl font-bold">{count}</span>
        </motion.div>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Preparando pago...
        </motion.p>
      </div>
    </motion.div>
  );
}

// --- Participant Avatar ---
function ParticipantAvatar({
  participant,
  isCurrentUser,
  index,
}: {
  participant: Participant;
  isCurrentUser: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="bg-secondary/30 flex items-center gap-3 rounded-xl p-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05, ...springSnappy }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-full font-semibold text-white',
            participant.color || 'bg-primary'
          )}
        >
          {participant.name?.[0]?.toUpperCase() || '?'}
        </div>

        {/* Ready indicator */}
        <AnimatePresence>
          {participant.isReady && (
            <motion.div
              className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-emerald-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={springBouncy}
            >
              <Check className="size-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Name */}
      <div className="flex-1">
        <p className="font-medium">
          {participant.name || 'Anónimo'}
          {isCurrentUser && <span className="text-muted-foreground ml-1 text-sm">(tú)</span>}
        </p>
        <p className="text-muted-foreground text-sm">
          {participant.isReady ? 'Listo' : 'Esperando...'}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * WaitingRoomPremium - Enhanced waiting room with premium animations
 */
export function WaitingRoomPremium({
  participants,
  currentUserId,
  isCurrentUserReady,
  onMarkReady,
  onCancelReady,
  onCountdownComplete,
  countdownSeconds = 3,
}: WaitingRoomPremiumProps) {
  const readyCount = participants.filter((p) => p.isReady).length;
  const totalCount = participants.length;
  const allReady = readyCount === totalCount && totalCount > 0;
  const [showCountdown, setShowCountdown] = React.useState(false);

  // Trigger countdown when all ready
  React.useEffect(() => {
    if (allReady) {
      const timer = setTimeout(() => setShowCountdown(true), 500);
      return () => clearTimeout(timer);
    }
    setShowCountdown(false);
  }, [allReady]);

  return (
    <div className="relative">
      {/* Countdown overlay */}
      <AnimatePresence>
        {showCountdown && (
          <CountdownOverlay seconds={countdownSeconds} onComplete={onCountdownComplete} />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
        >
          <motion.div
            className="bg-secondary/50 text-muted-foreground mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Clock className="size-4" />
            Esperando a todos
          </motion.div>

          <h1 className="font-serif text-3xl font-bold">¿Listos para pagar?</h1>
          <p className="text-muted-foreground mt-2">
            Confirma cuando hayas terminado de seleccionar
          </p>
        </motion.div>

        {/* Progress Ring */}
        <div className="flex justify-center py-4">
          <ProgressRing readyCount={readyCount} totalCount={totalCount} />
        </div>

        {/* Participants */}
        <motion.div
          className="bg-card border-border space-y-2 rounded-2xl border-2 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springSmooth }}
        >
          <div className="mb-3 flex items-center gap-2 px-2">
            <Users className="text-muted-foreground size-4" />
            <span className="text-muted-foreground text-sm font-medium">Participantes</span>
          </div>

          {participants.map((participant, index) => (
            <ParticipantAvatar
              key={participant.id}
              participant={participant}
              isCurrentUser={participant.id === currentUserId}
              index={index}
            />
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isCurrentUserReady ? (
            <button
              onClick={onCancelReady}
              className={cn(
                'h-14 w-full rounded-2xl',
                'border-border bg-card border-2',
                'text-foreground font-semibold',
                'hover:bg-accent transition-colors'
              )}
            >
              Cambiar mi selección
            </button>
          ) : (
            <motion.button
              onClick={onMarkReady}
              className={cn(
                'relative h-14 w-full overflow-hidden rounded-2xl',
                'bg-primary text-primary-foreground',
                'font-semibold',
                'shadow-primary/25 shadow-lg'
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shine */}
              <span className="absolute inset-0 translate-x-[-200%] bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[200%]" />

              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="size-5" />
                Estoy listo
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Info */}
        <motion.p
          className="text-muted-foreground text-center text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          El pago empezará automáticamente cuando todos estén listos
        </motion.p>
      </div>
    </div>
  );
}
