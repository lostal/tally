import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BillItemCard } from '@/components/bill/bill-item-card';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      onClick,
      onKeyDown,
      className,
      role,
      tabIndex,
      'aria-disabled': ariaDisabled,
    }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
      <div
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={className}
        role={role}
        tabIndex={tabIndex}
        aria-disabled={ariaDisabled}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('BillItemCard', () => {
  const defaultProps = {
    id: 'item-1',
    name: 'Pizza Margherita',
    priceCents: 1450,
    quantity: 1,
    isSelected: false,
    claimedQuantity: 1,
    onToggle: vi.fn(),
  };

  it('renders item name and price correctly', () => {
    render(<BillItemCard {...defaultProps} />);

    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<BillItemCard {...defaultProps} onToggle={onToggle} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows quantity badge when quantity > 1', () => {
    render(<BillItemCard {...defaultProps} quantity={3} />);

    expect(screen.getByText('×3')).toBeInTheDocument();
  });

  it('does not show quantity badge when quantity is 1', () => {
    render(<BillItemCard {...defaultProps} quantity={1} />);

    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });

  it('applies selected styling when isSelected is true', () => {
    render(<BillItemCard {...defaultProps} isSelected={true} />);

    const card = screen.getByRole('button');
    expect(card.className).toContain('bg-primary/5');
    expect(card.className).toContain('ring-primary');
  });

  it('applies default styling when isSelected is false', () => {
    render(<BillItemCard {...defaultProps} isSelected={false} />);

    const card = screen.getByRole('button');
    expect(card.className).toContain('bg-card');
  });

  it('is disabled when fully claimed by others and not selected', () => {
    render(<BillItemCard {...defaultProps} isFullyClaimed={true} isSelected={false} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card.className).toContain('cursor-not-allowed');
  });

  it('shows quantity selector when selected and quantity > 1', () => {
    const onQuantityChange = vi.fn();
    render(
      <BillItemCard
        {...defaultProps}
        isSelected={true}
        quantity={3}
        claimedQuantity={1}
        onQuantityChange={onQuantityChange}
      />
    );

    expect(screen.getByText('Claiming:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onQuantityChange when quantity button is clicked', () => {
    const onQuantityChange = vi.fn();
    render(
      <BillItemCard
        {...defaultProps}
        isSelected={true}
        quantity={3}
        claimedQuantity={1}
        onQuantityChange={onQuantityChange}
      />
    );

    fireEvent.click(screen.getByText('2'));

    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('supports keyboard navigation', () => {
    const onToggle = vi.fn();
    render(<BillItemCard {...defaultProps} onToggle={onToggle} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onToggle).toHaveBeenCalled();
  });
});
