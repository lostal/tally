'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { springSnappy, springBouncy } from '@/lib/motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// --- Animated Logo Component ---
export function AnimatedLogo({
  icon: Icon,
  label,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
}) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, ...springSnappy }}
    >
      {/* Icon with glow */}
      <motion.div
        className="relative mx-auto mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, ...springBouncy }}
      >
        <div className="bg-primary/20 absolute inset-0 scale-110 rounded-2xl blur-xl" />
        <div className="bg-primary/10 border-primary/20 relative flex size-16 items-center justify-center rounded-2xl border-2">
          <Icon className="text-primary size-8" />
        </div>
      </motion.div>

      <motion.h1
        className="font-serif text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.h1>

      {sublabel && (
        <motion.p
          className="text-muted-foreground mt-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {sublabel}
        </motion.p>
      )}
    </motion.div>
  );
}

// --- Animated Input Component ---
export function AnimatedInput({
  id,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required,
  autoFocus,
  disabled,
}: {
  id: string;
  type?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springSnappy}
    >
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border-2 px-4 py-3 text-sm',
            'bg-background placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus:outline-none',
            isFocused
              ? 'border-primary ring-primary/20 ring-2'
              : 'border-input hover:border-muted-foreground/50',
            isPassword && 'pr-12'
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// --- Animated Submit Button ---
export function AnimatedSubmitButton({
  children,
  isLoading,
  loadingText,
  disabled,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'relative h-12 w-full rounded-xl',
        'bg-primary text-primary-foreground',
        'text-sm font-semibold',
        'shadow-primary/20 shadow-lg',
        'transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'overflow-hidden'
      )}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Shine effect on hover */}
      <span className="bg-linear-to-rrom-transparent absolute inset-0 translate-x-[-200%] via-white/20 to-transparent transition-transform duration-700 hover:translate-x-[200%]" />

      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || 'Cargando...'}
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}

// --- Error Message ---
export function AnimatedError({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="bg-destructive/10 border-destructive/30 rounded-xl border px-4 py-3"
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
        >
          <p className="text-destructive text-center text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- PIN Input Display ---
export function PinDisplay({
  length,
  current,
  error,
}: {
  length: number;
  current: number;
  error?: boolean;
}) {
  return (
    <div className="flex justify-center gap-4">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'size-4 rounded-full transition-all duration-200',
            current > i ? 'bg-primary scale-110' : 'bg-muted',
            error && current > i && 'bg-destructive'
          )}
          animate={
            current > i
              ? {
                  scale: [1, 1.4, 1],
                  transition: { duration: 0.2 },
                }
              : {}
          }
        />
      ))}
    </div>
  );
}

// --- PIN Keypad ---
export function PinKeypad({
  onDigit,
  onClear,
  onDelete,
  disabled,
  isLoading,
}: {
  onDigit: (d: string) => void;
  onClear: () => void;
  onDelete: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-3">
      {digits.map((digit, index) => {
        const isAction = digit === 'C' || digit === '⌫';

        return (
          <motion.button
            key={digit}
            type="button"
            disabled={disabled || isLoading}
            onClick={() => {
              if (digit === 'C') onClear();
              else if (digit === '⌫') onDelete();
              else onDigit(digit);
            }}
            className={cn(
              'h-14 rounded-xl text-lg font-semibold transition-all duration-150',
              isAction
                ? 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                : 'bg-card border-border hover:bg-accent border-2',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.03 }}
            whileTap={{ scale: 0.92 }}
          >
            {isLoading && digit === '⌫' ? (
              <Loader2 className="mx-auto size-5 animate-spin" />
            ) : (
              digit
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// --- Login Card Wrapper ---
export function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--primary)/5,transparent_50%),radial-gradient(circle_at_70%_80%,var(--primary)/5,transparent_50%)]" />

      <motion.div
        className={cn(
          'relative w-full max-w-sm',
          'bg-card border-border rounded-3xl border-2',
          'space-y-6 p-8',
          'shadow-xl shadow-black/5'
        )}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={springSnappy}
      >
        {children}
      </motion.div>
    </div>
  );
}
