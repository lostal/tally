'use client';

import { PaymentErrorBoundary } from '@/components/shared/error-boundary';

interface PaymentLayoutProps {
  children: React.ReactNode;
}

/**
 * Payment Layout with Error Boundary
 *
 * Wraps payment-related pages with a specialized error boundary
 * that handles payment-critical errors gracefully.
 */
export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return <PaymentErrorBoundary>{children}</PaymentErrorBoundary>;
}
