import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TipSelector } from '@/components/payment/tip-selector';

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

describe('TipSelector', () => {
  const defaultProps = {
    value: 0,
    onChange: vi.fn(),
  };

  it('renders all default tip options', () => {
    render(<TipSelector {...defaultProps} />);

    expect(screen.getByText('No')).toBeInTheDocument(); // 0%
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders custom tip options', () => {
    render(<TipSelector {...defaultProps} options={[0, 5, 10, 25]} />);

    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shows header text', () => {
    render(<TipSelector {...defaultProps} />);

    expect(screen.getByText('Añadir propina')).toBeInTheDocument();
  });

  it('calls onChange when a tip is selected', () => {
    const onChange = vi.fn();
    render(<TipSelector {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText('15%'));

    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('calls onChange with 0 when "No" is selected', () => {
    const onChange = vi.fn();
    render(<TipSelector {...defaultProps} value={15} onChange={onChange} />);

    fireEvent.click(screen.getByText('No'));

    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('shows calculated tip amounts when subtotalCents is provided', () => {
    render(
      <TipSelector
        {...defaultProps}
        subtotalCents={2000} // €20.00
      />
    );

    // 10% of €20.00 = €2.00
    expect(screen.getByText('€2.00')).toBeInTheDocument();
    // 15% of €20.00 = €3.00
    expect(screen.getByText('€3.00')).toBeInTheDocument();
    // 20% of €20.00 = €4.00
    expect(screen.getByText('€4.00')).toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    render(<TipSelector {...defaultProps} value={15} />);

    // Find the 15% button
    const selectedButton = screen.getByText('15%').closest('button');
    expect(selectedButton).toBeInTheDocument();
  });

  it('handles rapid selection changes', () => {
    const onChange = vi.fn();
    render(<TipSelector {...defaultProps} onChange={onChange} />);

    fireEvent.click(screen.getByText('10%'));
    fireEvent.click(screen.getByText('15%'));
    fireEvent.click(screen.getByText('20%'));

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 10);
    expect(onChange).toHaveBeenNthCalledWith(2, 15);
    expect(onChange).toHaveBeenNthCalledWith(3, 20);
  });
});
