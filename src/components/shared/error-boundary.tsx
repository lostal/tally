'use client';

import * as React from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Fallback UI to show on error */
  fallback?: React.ReactNode;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset key - changing this resets the error state */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error (prep for Sentry)
    logger.error('ErrorBoundary caught error', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKey changes
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="border-destructive/20 bg-destructive/5 flex min-h-50 flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center">
      <div className="text-destructive text-4xl">⚠️</div>
      <div>
        <h3 className="text-lg font-semibold">Algo salió mal</h3>
        <p className="text-muted-foreground mt-1 text-sm">{error?.message || 'Error inesperado'}</p>
      </div>
      <button
        onClick={onReset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}

/**
 * Wrapper for payment-critical components
 */
export function PaymentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-75 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <span className="text-4xl">💳</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Error en el pago</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Por favor, recarga la página e inténtalo de nuevo.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            Recargar página
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Wrapper for bill components
 */
export function BillErrorBoundary({ children }: { children: React.ReactNode }) {
  const [resetKey, setResetKey] = React.useState(0);

  return (
    <ErrorBoundary
      resetKey={resetKey}
      fallback={
        <div className="flex min-h-50 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="text-4xl">🧾</div>
          <div>
            <h3 className="font-semibold">Error al cargar la cuenta</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Hubo un problema mostrando los artículos.
            </p>
          </div>
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="bg-secondary hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
