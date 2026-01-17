'use client';

import { BillErrorBoundary } from '@/components/shared/error-boundary';

interface BillLayoutProps {
  children: React.ReactNode;
}

/**
 * Bill Layout with Error Boundary
 *
 * Wraps bill-related pages with a specialized error boundary
 * that provides context-specific error messages and recovery options.
 */
export default function BillLayout({ children }: BillLayoutProps) {
  return <BillErrorBoundary>{children}</BillErrorBoundary>;
}
