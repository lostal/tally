-- ============================================
-- MIGRATION: Cash Management & Z-Report
-- Version: 009
-- Description: Tables for cash register management,
--              cash transactions (entries/exits),
--              and Z-Report generation.
-- ============================================

-- ============================================
-- 1. CASH REGISTERS (Turnos de Caja)
-- ============================================
-- Represents a cash register shift/session.
-- Only one register can be open per restaurant at a time.

CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Who opened/closed
    opened_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Opening state
    opening_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (opening_amount_cents >= 0),

    -- Closing state (populated when closed)
    expected_cash_cents INTEGER,      -- Calculated: opening + cash sales - cash refunds + entries - exits
    actual_cash_cents INTEGER,        -- Counted by staff
    difference_cents INTEGER,         -- actual - expected (can be negative = missing, positive = surplus)

    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,

    -- Z-Report snapshot (immutable once generated)
    z_report JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cash_registers_restaurant ON cash_registers(restaurant_id, opened_at DESC);
CREATE INDEX idx_cash_registers_status ON cash_registers(restaurant_id, status);
CREATE UNIQUE INDEX idx_cash_registers_open_unique ON cash_registers(restaurant_id) WHERE status = 'open';

COMMENT ON TABLE cash_registers IS 'Cash register shifts (turnos de caja). Only one can be open per restaurant.';
COMMENT ON COLUMN cash_registers.z_report IS 'Immutable Z-Report JSON snapshot generated at close time.';

-- ============================================
-- 2. CASH TRANSACTIONS (Entradas/Salidas)
-- ============================================
-- Manual cash movements: entries (cambio del banco) or exits (propinas, pagos proveedores).

CREATE TABLE cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Transaction details
    type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    reason TEXT NOT NULL,
    notes TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cash_transactions_register ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_restaurant ON cash_transactions(restaurant_id, created_at DESC);

COMMENT ON TABLE cash_transactions IS 'Manual cash entries and exits during a register shift.';
COMMENT ON COLUMN cash_transactions.type IS '''entry'' = money added to register, ''exit'' = money removed from register.';

-- ============================================
-- 3. UPDATED_AT TRIGGER
-- ============================================
CREATE TRIGGER tr_cash_registers_updated_at
BEFORE UPDATE ON cash_registers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

-- Cash Registers: Only manager/owner can view their restaurant's registers
CREATE POLICY "Staff can view their restaurant's cash registers"
    ON cash_registers FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Cash Registers: Only manager/owner can insert (open register)
CREATE POLICY "Manager/owner can open cash registers"
    ON cash_registers FOR INSERT
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Cash Registers: Only manager/owner can update (close register)
CREATE POLICY "Manager/owner can close cash registers"
    ON cash_registers FOR UPDATE
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Cash Transactions: Only manager/owner can view
CREATE POLICY "Staff can view their restaurant's cash transactions"
    ON cash_transactions FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Cash Transactions: Only manager/owner can insert
CREATE POLICY "Manager/owner can add cash transactions"
    ON cash_transactions FOR INSERT
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- ============================================
-- 5. Z-REPORT GENERATION FUNCTION
-- ============================================
-- Calculates and stores Z-Report data when closing a register.

CREATE OR REPLACE FUNCTION generate_z_report(p_register_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_register RECORD;
    v_report JSONB;
    v_card_sales RECORD;
    v_tips BIGINT;
    v_transactions RECORD;
BEGIN
    -- Get register data
    SELECT * INTO v_register
    FROM cash_registers
    WHERE id = p_register_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cash register not found: %', p_register_id;
    END IF;

    -- Calculate card/online sales during this period
    -- (Payments completed during register shift)
    SELECT
        COUNT(*) as count,
        COALESCE(SUM(amount_cents), 0) as total_cents
    INTO v_card_sales
    FROM payments p
    JOIN payment_sessions ps ON ps.id = p.session_id
    JOIN orders o ON o.id = ps.order_id
    WHERE o.restaurant_id = v_register.restaurant_id
    AND p.status = 'completed'
    AND p.completed_at >= v_register.opened_at
    AND (v_register.closed_at IS NULL OR p.completed_at <= v_register.closed_at);

    -- Calculate tips during this period
    SELECT COALESCE(SUM(tip_cents), 0)
    INTO v_tips
    FROM payments p
    JOIN payment_sessions ps ON ps.id = p.session_id
    JOIN orders o ON o.id = ps.order_id
    WHERE o.restaurant_id = v_register.restaurant_id
    AND p.status = 'completed'
    AND p.completed_at >= v_register.opened_at
    AND (v_register.closed_at IS NULL OR p.completed_at <= v_register.closed_at);

    -- Calculate manual transactions (entries - exits)
    SELECT
        COALESCE(SUM(CASE WHEN type = 'entry' THEN amount_cents ELSE 0 END), 0) as entries_cents,
        COALESCE(SUM(CASE WHEN type = 'exit' THEN amount_cents ELSE 0 END), 0) as exits_cents,
        COUNT(CASE WHEN type = 'entry' THEN 1 END) as entry_count,
        COUNT(CASE WHEN type = 'exit' THEN 1 END) as exit_count
    INTO v_transactions
    FROM cash_transactions
    WHERE register_id = p_register_id;

    -- Build Z-Report JSON
    v_report := jsonb_build_object(
        'generatedAt', NOW(),
        'period', jsonb_build_object(
            'start', v_register.opened_at,
            'end', COALESCE(v_register.closed_at, NOW())
        ),
        'openingAmount', v_register.opening_amount_cents,
        'sales', jsonb_build_object(
            'card', jsonb_build_object(
                'count', v_card_sales.count,
                'totalCents', v_card_sales.total_cents
            ),
            'cash', jsonb_build_object(
                'count', 0,
                'totalCents', 0
            )
        ),
        'tips', jsonb_build_object(
            'totalCents', v_tips
        ),
        'transactions', jsonb_build_object(
            'entries', v_transactions.entry_count,
            'entriesCents', v_transactions.entries_cents,
            'exits', v_transactions.exit_count,
            'exitsCents', v_transactions.exits_cents,
            'netCents', v_transactions.entries_cents - v_transactions.exits_cents
        ),
        'totals', jsonb_build_object(
            'grossSalesCents', v_card_sales.total_cents,
            'tipsCents', v_tips
        )
    );

    RETURN v_report;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_z_report IS 'Generates Z-Report JSON for a cash register shift.';

-- ============================================
-- 6. CLOSE REGISTER FUNCTION
-- ============================================
-- Atomically closes a register and generates Z-Report.

CREATE OR REPLACE FUNCTION close_cash_register(
    p_register_id UUID,
    p_actual_cash_cents INTEGER,
    p_closed_by UUID
)
RETURNS cash_registers AS $$
DECLARE
    v_register cash_registers;
    v_report JSONB;
    v_expected INTEGER;
    v_transactions RECORD;
BEGIN
    -- Lock the register row
    SELECT * INTO v_register
    FROM cash_registers
    WHERE id = p_register_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cash register not found: %', p_register_id;
    END IF;

    IF v_register.status = 'closed' THEN
        RAISE EXCEPTION 'Cash register is already closed';
    END IF;

    -- Calculate transactions total
    SELECT
        COALESCE(SUM(CASE WHEN type = 'entry' THEN amount_cents ELSE -amount_cents END), 0)
    INTO v_expected
    FROM cash_transactions
    WHERE register_id = p_register_id;

    -- Expected = opening + manual transactions (entries - exits)
    -- Note: Card payments don't affect cash drawer
    v_expected := v_register.opening_amount_cents + v_expected;

    -- Generate Z-Report
    v_report := generate_z_report(p_register_id);

    -- Update register with closing data
    UPDATE cash_registers
    SET
        status = 'closed',
        closed_at = NOW(),
        closed_by = p_closed_by,
        expected_cash_cents = v_expected,
        actual_cash_cents = p_actual_cash_cents,
        difference_cents = p_actual_cash_cents - v_expected,
        z_report = v_report
    WHERE id = p_register_id
    RETURNING * INTO v_register;

    RETURN v_register;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION close_cash_register IS 'Closes a cash register, calculates expected vs actual, and generates Z-Report.';
