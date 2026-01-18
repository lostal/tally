-- Migration: Void and Refund Functionality
-- Description: Add support for voiding orders and refunding payments with approval workflow

-- ============================================
-- Void Approvals Table
-- ============================================

-- Table for tracking void order requests and approvals
CREATE TABLE IF NOT EXISTS void_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes for efficient queries
CREATE INDEX idx_void_approvals_restaurant ON void_approvals(restaurant_id, status);
CREATE INDEX idx_void_approvals_order ON void_approvals(order_id);
CREATE INDEX idx_void_approvals_requester ON void_approvals(requested_by);

-- ============================================
-- Order Void Tracking
-- ============================================

-- Add void tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS void_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id);

-- Index for voided orders
CREATE INDEX IF NOT EXISTS idx_orders_voided ON orders(voided_at) WHERE voided_at IS NOT NULL;

-- ============================================
-- Payment Refund Tracking
-- ============================================

-- Add refund tracking columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER;

-- Index for refunded payments
CREATE INDEX IF NOT EXISTS idx_payments_refunded ON payments(refunded_at) WHERE refunded_at IS NOT NULL;

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS for void_approvals
ALTER TABLE void_approvals ENABLE ROW LEVEL SECURITY;

-- Staff can view void approvals for their restaurant
CREATE POLICY "Staff can view void approvals for their restaurant"
    ON void_approvals FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id
            FROM users
            WHERE auth_id = auth.uid()
        )
    );

-- Staff can create void approval requests
CREATE POLICY "Staff can create void approval requests"
    ON void_approvals FOR INSERT
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id
            FROM users
            WHERE auth_id = auth.uid()
        )
    );

-- Only managers and owners can update void approvals
CREATE POLICY "Managers can update void approvals"
    ON void_approvals FOR UPDATE
    USING (
        restaurant_id IN (
            SELECT restaurant_id
            FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to automatically deny old pending void approvals (cleanup)
CREATE OR REPLACE FUNCTION deny_old_void_approvals()
RETURNS void AS $$
BEGIN
    UPDATE void_approvals
    SET status = 'denied',
        resolved_at = NOW()
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE void_approvals IS 'Tracks void order requests and manager approvals';
COMMENT ON COLUMN void_approvals.reason IS 'Why the order needs to be voided';
COMMENT ON COLUMN void_approvals.status IS 'pending, approved, or denied';

COMMENT ON COLUMN orders.voided_at IS 'Timestamp when order was voided';
COMMENT ON COLUMN orders.void_reason IS 'Reason for voiding the order';
COMMENT ON COLUMN orders.voided_by IS 'User who voided the order';

COMMENT ON COLUMN payments.refunded_at IS 'Timestamp when payment was refunded';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for the refund';
COMMENT ON COLUMN payments.refunded_by IS 'User who processed the refund';
COMMENT ON COLUMN payments.refund_amount_cents IS 'Amount refunded in cents (can be partial)';
