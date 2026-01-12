import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentSummary } from '@/components/payment/payment-summary';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      className,
    }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// Mock CurrencyDisplay to simplify testing
vi.mock('@/components/shared/currency-display', () => ({
  CurrencyDisplay: ({ amountCents }: { amountCents: number }) => (
    <span>€{(amountCents / 100).toFixed(2)}</span>
  ),
}));

// Mock Card components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock Separator
vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('PaymentSummary', () => {
  const defaultProps = {
    subtotalCents: 2500,
    tipCents: 375,
    tipPercentage: 15,
    totalCents: 2875,
  };

  it('displays subtotal correctly', () => {
    render(<PaymentSummary {...defaultProps} />);

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('€25.00')).toBeInTheDocument();
  });

  it('displays tip with percentage', () => {
    render(<PaymentSummary {...defaultProps} />);

    expect(screen.getByText('Propina (15%)')).toBeInTheDocument();
    expect(screen.getByText('€3.75')).toBeInTheDocument();
  });

  it('displays total correctly', () => {
    render(<PaymentSummary {...defaultProps} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('€28.75')).toBeInTheDocument();
  });

  it('shows propina label without percentage when 0', () => {
    render(<PaymentSummary {...defaultProps} tipCents={0} tipPercentage={0} totalCents={2500} />);

    // Should show "Propina " without percentage
    expect(screen.getByText('Propina')).toBeInTheDocument();
  });

  it('handles large amounts correctly', () => {
    render(
      <PaymentSummary
        subtotalCents={125000}
        tipCents={25000}
        tipPercentage={20}
        totalCents={150000}
      />
    );

    expect(screen.getByText('€1250.00')).toBeInTheDocument();
    expect(screen.getByText('€250.00')).toBeInTheDocument();
    expect(screen.getByText('€1500.00')).toBeInTheDocument();
  });

  it('handles zero amounts', () => {
    render(<PaymentSummary subtotalCents={0} tipCents={0} tipPercentage={0} totalCents={0} />);

    // Should have three €0.00 values (subtotal, tip, total)
    const zeroValues = screen.getAllByText('€0.00');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);
  });
});
