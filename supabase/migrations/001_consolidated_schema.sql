-- ============================================
-- TALLY - Consolidated Database Schema
-- ============================================
-- This single migration creates the complete database schema for Tally POS
-- Consolidated from migrations 001-011 for a clean production deployment
-- ============================================

-- ============================================
-- SECTION 1: ENUMS
-- ============================================
CREATE TYPE subscription_plan AS ENUM ('essential', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- ============================================
-- SECTION 2: CORE TABLES
-- ============================================

-- ============================================
-- 2.1 RESTAURANTS
-- ============================================
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    theme JSONB DEFAULT '{"primaryColor": "#000000", "accentColor": "#22c55e"}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,

    -- Owner reference
    owner_auth_id UUID,
    subscription_id UUID, -- Will add FK after subscriptions table is created

    -- Fiscal information (for invoices)
    fiscal_name TEXT,
    tax_id TEXT, -- CIF/NIF
    fiscal_address TEXT,
    fiscal_city TEXT,
    fiscal_postal_code TEXT,
    fiscal_country TEXT DEFAULT 'ES',

    -- Payment flow configuration
    payment_mode TEXT DEFAULT 'auto' CHECK (payment_mode IN ('auto', 'manual')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for restaurants
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_auth_id);
CREATE INDEX idx_restaurants_payment_mode ON restaurants(payment_mode);

COMMENT ON COLUMN restaurants.tax_id IS 'CIF/NIF for fiscal invoices';
COMMENT ON COLUMN restaurants.fiscal_name IS 'Legal business name for invoices';
COMMENT ON COLUMN restaurants.payment_mode IS 'Payment flow mode: auto (QR active immediately) or manual (waiter must enable)';

-- ============================================
-- 2.2 SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Plan details
    plan subscription_plan NOT NULL DEFAULT 'essential',
    status subscription_status NOT NULL DEFAULT 'trialing',

    -- Stripe integration
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,

    -- Billing dates
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,

    -- Plan limits
    max_tables INTEGER DEFAULT 3,
    max_users INTEGER DEFAULT 1,
    has_kds BOOLEAN DEFAULT false,
    commission_rate DECIMAL(4,2) DEFAULT 1.90,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Add FK constraint to restaurants now that subscriptions exists
ALTER TABLE restaurants
ADD CONSTRAINT fk_restaurants_subscription
FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);

-- ============================================
-- 2.3 USERS (Restaurant Staff)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    auth_id UUID UNIQUE, -- Links to Supabase Auth
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'waiter')),
    pin TEXT, -- For quick waiter login (hashed)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_restaurant ON users(restaurant_id);
CREATE INDEX idx_users_auth ON users(auth_id);

-- ============================================
-- 2.4 TABLES
-- ============================================
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'paying', 'reserved')),
    qr_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, number)
);

-- Indexes for tables
CREATE INDEX idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX idx_tables_status ON tables(restaurant_id, status);

-- ============================================
-- 2.5 CATEGORIES
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- KDS routing (food goes to kitchen, drink goes to bar)
    category_type TEXT DEFAULT 'food' CHECK (category_type IN ('food', 'drink')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for categories
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);
CREATE INDEX idx_categories_type ON categories(restaurant_id, category_type);

COMMENT ON COLUMN categories.category_type IS 'Category routing type for KDS: food (kitchen) or drink (bar)';

-- ============================================
-- 2.6 PRODUCTS
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,

    -- Tax rate (Spanish hospitality VAT = 10%)
    tax_rate DECIMAL(4,2) DEFAULT 10.00,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(restaurant_id, is_available);

COMMENT ON COLUMN products.tax_rate IS 'VAT rate as percentage (e.g. 10.00 for 10%). Spanish hospitality default.';

-- ============================================
-- 2.7 PRODUCT MODIFIERS (extras, sizes, etc.)
-- ============================================
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_cents INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for product modifiers
CREATE INDEX idx_modifiers_product ON product_modifiers(product_id);

-- ============================================
-- SECTION 3: ORDER MANAGEMENT
-- ============================================

-- ============================================
-- 3.1 SESSIONS (Bill Splitting Sessions)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Indexes for sessions
CREATE INDEX idx_sessions_restaurant ON sessions(restaurant_id);
CREATE INDEX idx_sessions_table ON sessions(table_id);
CREATE INDEX idx_sessions_status ON sessions(status);

-- ============================================
-- 3.2 PARTICIPANTS (Session participants for bill splitting)
-- ============================================
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID, -- Optional link to auth users
    name TEXT NOT NULL,
    avatar_url TEXT,
    is_host BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1 -- For optimistic locking
);

-- Index for participants
CREATE INDEX idx_participants_session ON participants(session_id);

-- ============================================
-- 3.3 ORDERS (Comandas)
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'served', 'paying', 'closed', 'cancelled')),
    subtotal_cents INTEGER DEFAULT 0,
    discount_cents INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,

    -- Void tracking
    voided_at TIMESTAMPTZ,
    void_reason TEXT,
    voided_by UUID REFERENCES users(id)
);

-- Indexes for orders
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_waiter ON orders(waiter_id);
CREATE INDEX idx_orders_voided ON orders(voided_at) WHERE voided_at IS NOT NULL;

COMMENT ON COLUMN orders.voided_at IS 'Timestamp when order was voided';
COMMENT ON COLUMN orders.void_reason IS 'Reason for voiding the order';
COMMENT ON COLUMN orders.voided_by IS 'User who voided the order';

-- ============================================
-- 3.4 ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL,
    modifiers JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'served', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Optimistic locking for bill splitting
    version INTEGER DEFAULT 1,
    claimed_by UUID REFERENCES participants(id),
    claimed_quantity INTEGER DEFAULT 0
);

-- Indexes for order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

COMMENT ON COLUMN order_items.version IS 'Version for optimistic locking - increment on each update';
COMMENT ON COLUMN order_items.claimed_by IS 'Participant who claimed this item';
COMMENT ON COLUMN order_items.claimed_quantity IS 'How many of this item are claimed';

-- ============================================
-- SECTION 4: PAYMENT PROCESSING
-- ============================================

-- ============================================
-- 4.1 PAYMENT SESSIONS
-- ============================================
CREATE TABLE payment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    total_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for payment sessions
CREATE INDEX idx_payment_sessions_order ON payment_sessions(order_id);
CREATE INDEX idx_payment_sessions_status ON payment_sessions(status);

-- ============================================
-- 4.2 PAYMENTS (Individual payments within a session)
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL, -- Anonymous identifier for the payer
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    tip_cents INTEGER DEFAULT 0,
    payment_method TEXT CHECK (payment_method IN ('card', 'apple_pay', 'google_pay')),
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    items_paid JSONB DEFAULT '[]'::jsonb, -- Array of {order_item_id, quantity}
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Refund tracking
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    refunded_by UUID REFERENCES users(id),
    refund_amount_cents INTEGER
);

-- Indexes for payments
CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_id);
CREATE INDEX idx_payments_refunded ON payments(refunded_at) WHERE refunded_at IS NOT NULL;

COMMENT ON COLUMN payments.refunded_at IS 'Timestamp when payment was refunded';
COMMENT ON COLUMN payments.refund_reason IS 'Reason for the refund';
COMMENT ON COLUMN payments.refunded_by IS 'User who processed the refund';
COMMENT ON COLUMN payments.refund_amount_cents IS 'Amount refunded in cents (can be partial)';

-- ============================================
-- SECTION 5: FISCAL & INVOICING (Verifactu Compliance)
-- ============================================

-- ============================================
-- 5.1 INVOICES
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

    -- Sequential numbering (required by Spanish law)
    invoice_number TEXT NOT NULL,
    series TEXT DEFAULT 'A', -- Invoice series (A, B, etc.)

    -- Amounts in cents
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,

    -- Tax breakdown (JSON for multiple rates)
    tax_breakdown JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"rate": 10, "base_cents": 1000, "tax_cents": 100}]

    -- Invoice status
    status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')),

    -- Verifactu compliance
    hash TEXT, -- SHA-256 hash for chain integrity
    previous_hash TEXT, -- Link to previous invoice hash
    qr_code TEXT, -- QR code data for verification

    -- Soft delete (invoices are never physically deleted per Verifactu)
    deleted_at TIMESTAMPTZ,

    -- Timestamps
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint on restaurant + series + number
    UNIQUE(restaurant_id, series, invoice_number)
);

-- Indexes for invoices
CREATE INDEX idx_invoices_restaurant ON invoices(restaurant_id);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_number ON invoices(restaurant_id, series, invoice_number);
CREATE INDEX idx_invoices_issued ON invoices(restaurant_id, issued_at);
CREATE INDEX idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp - invoices are never physically deleted per Verifactu';

-- ============================================
-- 5.2 INVOICE ITEMS
-- ============================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    -- Product reference (denormalized for fiscal immutability)
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL,
    tax_rate DECIMAL(4,2) NOT NULL DEFAULT 10.00,

    -- Calculated amounts
    subtotal_cents INTEGER NOT NULL, -- quantity * unit_price
    tax_cents INTEGER NOT NULL,      -- subtotal * tax_rate / 100
    total_cents INTEGER NOT NULL,    -- subtotal + tax

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- SECTION 6: VOID APPROVALS
-- ============================================
CREATE TABLE void_approvals (
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

-- Indexes for void approvals
CREATE INDEX idx_void_approvals_restaurant ON void_approvals(restaurant_id, status);
CREATE INDEX idx_void_approvals_order ON void_approvals(order_id);
CREATE INDEX idx_void_approvals_requester ON void_approvals(requested_by);

COMMENT ON TABLE void_approvals IS 'Tracks void order requests and manager approvals';
COMMENT ON COLUMN void_approvals.reason IS 'Why the order needs to be voided';
COMMENT ON COLUMN void_approvals.status IS 'pending, approved, or denied';

-- ============================================
-- SECTION 7: AUDIT LOGGING
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,  -- 'void_order', 'refund_payment', 'update_menu', etc.
    resource_type TEXT NOT NULL,  -- 'order', 'payment', 'product', etc.
    resource_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_restaurant ON audit_logs(restaurant_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for privileged operations and sensitive actions';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., void_order, refund_payment)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., order, payment, product)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context about the action (JSON format)';

-- ============================================
-- SECTION 8: CASH MANAGEMENT
-- ============================================

-- ============================================
-- 8.1 CASH REGISTERS (Turnos de Caja)
-- ============================================
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
    difference_cents INTEGER,         -- actual - expected (negative = missing, positive = surplus)

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

-- Indexes for cash registers
CREATE INDEX idx_cash_registers_restaurant ON cash_registers(restaurant_id, opened_at DESC);
CREATE INDEX idx_cash_registers_status ON cash_registers(restaurant_id, status);
CREATE UNIQUE INDEX idx_cash_registers_open_unique ON cash_registers(restaurant_id) WHERE status = 'open';

COMMENT ON TABLE cash_registers IS 'Cash register shifts (turnos de caja). Only one can be open per restaurant.';
COMMENT ON COLUMN cash_registers.z_report IS 'Immutable Z-Report JSON snapshot generated at close time.';

-- ============================================
-- 8.2 CASH TRANSACTIONS (Entradas/Salidas)
-- ============================================
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

-- Indexes for cash transactions
CREATE INDEX idx_cash_transactions_register ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_restaurant ON cash_transactions(restaurant_id, created_at DESC);

COMMENT ON TABLE cash_transactions IS 'Manual cash entries and exits during a register shift.';
COMMENT ON COLUMN cash_transactions.type IS '''entry'' = money added to register, ''exit'' = money removed from register.';

-- ============================================
-- SECTION 9: SEQUENCES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ============================================
-- SECTION 10: FUNCTIONS
-- ============================================

-- ============================================
-- 10.1 UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.2 GENERATE INVOICE NUMBER
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number(p_restaurant_id UUID, p_series TEXT DEFAULT 'A')
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');

    -- Get the next number for this restaurant/series/year
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM invoices
    WHERE restaurant_id = p_restaurant_id
    AND series = p_series
    AND invoice_number LIKE year_prefix || '-%';

    RETURN year_prefix || '-' || p_series || '-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.3 GENERATE INVOICE HASH (Verifactu)
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_hash(p_invoice_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_invoice RECORD;
    v_prev_hash TEXT;
    v_data_to_hash TEXT;
    v_hash TEXT;
BEGIN
    -- Get invoice data
    SELECT
        id, restaurant_id, invoice_number, series,
        subtotal_cents, tax_cents, total_cents,
        issued_at
    INTO v_invoice
    FROM invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_id;
    END IF;

    -- Get previous hash (for chain integrity)
    SELECT hash INTO v_prev_hash
    FROM invoices
    WHERE restaurant_id = v_invoice.restaurant_id
    AND series = v_invoice.series
    AND issued_at < v_invoice.issued_at
    AND hash IS NOT NULL
    ORDER BY issued_at DESC
    LIMIT 1;

    -- Build data string for hashing
    v_data_to_hash := CONCAT(
        v_invoice.invoice_number, '|',
        v_invoice.total_cents, '|',
        TO_CHAR(v_invoice.issued_at, 'YYYY-MM-DD HH24:MI:SS'), '|',
        COALESCE(v_prev_hash, 'GENESIS')
    );

    -- Generate SHA-256 hash
    v_hash := encode(sha256(convert_to(v_data_to_hash, 'UTF8')), 'hex');

    -- Update invoice with hash
    UPDATE invoices
    SET
        hash = v_hash,
        previous_hash = v_prev_hash
    WHERE id = p_invoice_id;

    RETURN v_hash;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.4 GENERATE INVOICE QR DATA
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_qr_data(p_invoice_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_invoice RECORD;
    v_qr_data TEXT;
BEGIN
    SELECT i.*, r.tax_id, r.fiscal_name
    INTO v_invoice
    FROM invoices i
    JOIN restaurants r ON r.id = i.restaurant_id
    WHERE i.id = p_invoice_id;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Verifactu QR format (simplified)
    v_qr_data := CONCAT(
        'TALLY|',
        v_invoice.tax_id, '|',
        v_invoice.invoice_number, '|',
        v_invoice.issued_at, '|',
        v_invoice.total_cents, '|',
        SUBSTRING(v_invoice.hash FROM 1 FOR 8)
    );

    -- Update invoice with QR data
    UPDATE invoices SET qr_code = v_qr_data WHERE id = p_invoice_id;

    RETURN v_qr_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.5 CLAIM ORDER ITEM (Optimistic Locking)
-- ============================================
CREATE OR REPLACE FUNCTION claim_order_item(
    p_item_id UUID,
    p_participant_id UUID,
    p_quantity INTEGER,
    p_expected_version INTEGER
) RETURNS TABLE(
    success BOOLEAN,
    new_version INTEGER,
    error_message TEXT
) AS $$
DECLARE
    current_ver INTEGER;
    available_qty INTEGER;
    total_qty INTEGER;
    already_claimed INTEGER;
BEGIN
    -- Lock the row
    SELECT version, quantity INTO current_ver, total_qty
    FROM order_items
    WHERE id = p_item_id
    FOR UPDATE;

    -- Check version
    IF current_ver != p_expected_version THEN
        RETURN QUERY SELECT
            FALSE,
            current_ver,
            'Version mismatch - item was modified'::TEXT;
        RETURN;
    END IF;

    -- Calculate already claimed quantity (by others)
    SELECT COALESCE(SUM(claimed_quantity), 0) INTO already_claimed
    FROM order_items
    WHERE id = p_item_id
    AND claimed_by IS NOT NULL
    AND claimed_by != p_participant_id;

    available_qty := total_qty - already_claimed;

    -- Check if requested quantity is available
    IF p_quantity > available_qty THEN
        RETURN QUERY SELECT
            FALSE,
            current_ver,
            format('Not enough available. Requested: %s, Available: %s', p_quantity, available_qty);
        RETURN;
    END IF;

    -- Update the claim
    UPDATE order_items
    SET
        claimed_by = p_participant_id,
        claimed_quantity = p_quantity,
        version = version + 1
    WHERE id = p_item_id;

    RETURN QUERY SELECT
        TRUE,
        current_ver + 1,
        NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.6 RELEASE ORDER ITEM CLAIM
-- ============================================
CREATE OR REPLACE FUNCTION release_order_item(
    p_item_id UUID,
    p_participant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE order_items
    SET
        claimed_by = NULL,
        claimed_quantity = 0,
        version = version + 1
    WHERE id = p_item_id
    AND claimed_by = p_participant_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.7 SUBSCRIPTION PLAN LIMITS
-- ============================================
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan subscription_plan)
RETURNS TABLE(max_tables INTEGER, max_users INTEGER, has_kds BOOLEAN, commission_rate DECIMAL) AS $$
BEGIN
    CASE p_plan
        WHEN 'essential' THEN
            -- Essential: 0 tables (Keypad only), 1 user, 1.9% commission
            RETURN QUERY SELECT 0, 1, false, 1.90::DECIMAL;
        WHEN 'pro' THEN
            -- Pro: 15 tables, 5 users, KDS, 1.5% commission
            RETURN QUERY SELECT 15, 5, true, 1.50::DECIMAL;
        WHEN 'enterprise' THEN
            -- Enterprise: Unlimited, Unlimited, KDS, 1.2% commission
            RETURN QUERY SELECT 999, 999, true, 1.20::DECIMAL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.8 CHECK SUBSCRIPTION STATUS
-- ============================================
CREATE OR REPLACE FUNCTION is_subscription_active(p_restaurant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status subscription_status;
    v_trial_end TIMESTAMPTZ;
BEGIN
    SELECT status, trial_end INTO v_status, v_trial_end
    FROM subscriptions
    WHERE restaurant_id = p_restaurant_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Active or in trial
    IF v_status IN ('active', 'trialing') THEN
        -- Check trial hasn't expired
        IF v_status = 'trialing' AND v_trial_end < NOW() THEN
            RETURN false;
        END IF;
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.9 SUBSCRIPTION LIMITS TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_limits RECORD;
BEGIN
    SELECT * INTO v_limits FROM get_plan_limits(NEW.plan);

    NEW.max_tables := v_limits.max_tables;
    NEW.max_users := v_limits.max_users;
    NEW.has_kds := v_limits.has_kds;
    NEW.commission_rate := v_limits.commission_rate;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.10 DENY OLD VOID APPROVALS
-- ============================================
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
-- 10.11 TRIGGER HASH INVOICE
-- ============================================
CREATE OR REPLACE FUNCTION trigger_hash_invoice()
RETURNS TRIGGER AS $$
BEGIN
    -- Only hash if status is 'issued' and hash is not set
    IF NEW.status = 'issued' AND NEW.hash IS NULL THEN
        PERFORM generate_invoice_hash(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.12 PREVENT INVOICE DELETE (Verifactu)
-- ============================================
CREATE OR REPLACE FUNCTION prevent_invoice_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Invoices cannot be deleted per Verifactu compliance. Use soft delete (UPDATE deleted_at) instead.';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10.13 Z-REPORT GENERATION
-- ============================================
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
-- 10.14 CLOSE CASH REGISTER
-- ============================================
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

-- ============================================
-- SECTION 11: TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER tr_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_cash_registers_updated_at BEFORE UPDATE ON cash_registers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Subscription limits trigger
CREATE TRIGGER tr_subscription_plan_change
BEFORE INSERT OR UPDATE OF plan ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_limits();

-- Invoice hash trigger
CREATE TRIGGER tr_invoice_hash
AFTER INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_hash_invoice();

-- Prevent invoice delete trigger
CREATE TRIGGER tr_prevent_invoice_delete
BEFORE DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION prevent_invoice_delete();

-- ============================================
-- SECTION 12: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE void_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 12.1 RESTAURANTS POLICIES
-- ============================================
-- Anyone can read active restaurants by slug
CREATE POLICY "Public can view active restaurants" ON restaurants
    FOR SELECT USING (is_active = true);

-- Owners can view own restaurant (including by staff membership)
CREATE POLICY "Owners can view own restaurant" ON restaurants
    FOR SELECT
    USING (owner_auth_id = auth.uid() OR id IN (
        SELECT restaurant_id FROM users WHERE auth_id = auth.uid()
    ));

-- Authenticated users can create their own restaurant
CREATE POLICY "Authenticated users can create restaurant" ON restaurants
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_auth_id = auth.uid());

-- Owners can update their restaurant
CREATE POLICY "Owners can update their restaurant" ON restaurants
    FOR UPDATE
    USING (owner_auth_id = auth.uid());

-- ============================================
-- 12.2 SUBSCRIPTIONS POLICIES
-- ============================================
-- Restaurant owners can view subscription
CREATE POLICY "Restaurant owners can view subscription" ON subscriptions
    FOR SELECT
    USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_auth_id = auth.uid()
        )
    );

-- Owners can view their subscriptions
CREATE POLICY "Owners can view their subscriptions" ON subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Owners can create subscriptions
CREATE POLICY "Owners can create subscriptions" ON subscriptions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Owners can update their subscriptions
CREATE POLICY "Owners can update their subscriptions" ON subscriptions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- ============================================
-- 12.3 USERS POLICIES
-- ============================================
-- Allow users to view their own profile based on auth_id
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth_id = auth.uid());

-- Authenticated users can create own profile
CREATE POLICY "Authenticated users can create own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth_id = auth.uid());

-- ============================================
-- 12.4 TABLES POLICIES
-- ============================================
-- Anyone can read tables for active restaurants
CREATE POLICY "Public can view tables" ON tables
    FOR SELECT USING (
        is_active = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- Owners can create tables
CREATE POLICY "Owners can create tables" ON tables
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Owners can view their tables
CREATE POLICY "Owners can view their tables" ON tables
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Owners can update their tables
CREATE POLICY "Owners can update their tables" ON tables
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Owners can delete their tables
CREATE POLICY "Owners can delete their tables" ON tables
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- ============================================
-- 12.5 CATEGORIES POLICIES
-- ============================================
-- Anyone can read active categories
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (
        is_active = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- ============================================
-- 12.6 PRODUCTS POLICIES
-- ============================================
-- Anyone can read available products
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (
        is_available = true AND
        EXISTS (SELECT 1 FROM restaurants r WHERE r.id = restaurant_id AND r.is_active = true)
    );

-- ============================================
-- 12.7 PRODUCT MODIFIERS POLICIES
-- ============================================
-- Anyone can read modifiers for available products
CREATE POLICY "Public can view modifiers" ON product_modifiers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_available = true)
    );

-- ============================================
-- 12.8 SESSIONS POLICIES
-- ============================================
-- Public access for demos/dev
CREATE POLICY "Public can view active sessions" ON sessions
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can insert sessions" ON sessions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 12.9 PARTICIPANTS POLICIES
-- ============================================
CREATE POLICY "Public can view participants" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Public can insert participants" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update own participant" ON participants
    FOR UPDATE USING (true);

-- ============================================
-- 12.10 ORDERS POLICIES
-- ============================================
-- Anyone can read open/paying orders (for payment flow)
CREATE POLICY "Public can view active orders" ON orders
    FOR SELECT USING (status IN ('open', 'served', 'paying'));

-- ============================================
-- 12.11 ORDER ITEMS POLICIES
-- ============================================
-- Anyone can read order items for active orders
CREATE POLICY "Public can view order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.status IN ('open', 'served', 'paying'))
    );

-- ============================================
-- 12.12 PAYMENT SESSIONS POLICIES
-- ============================================
-- Anyone can read active payment sessions
CREATE POLICY "Public can view payment sessions" ON payment_sessions
    FOR SELECT USING (status = 'active');

-- ============================================
-- 12.13 PAYMENTS POLICIES
-- ============================================
-- Anyone can read their own payments (via participant_id)
CREATE POLICY "Public can view payments" ON payments
    FOR SELECT USING (true);

-- ============================================
-- 12.14 VOID APPROVALS POLICIES
-- ============================================
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
-- 12.15 AUDIT LOGS POLICIES
-- ============================================
-- Only managers and owners can view audit logs
CREATE POLICY "Users can view audit logs for their restaurant"
    ON audit_logs FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id
            FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- System can insert audit logs (using service role)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- 12.16 CASH REGISTERS POLICIES
-- ============================================
-- Only manager/owner can view their restaurant's registers
CREATE POLICY "Staff can view their restaurant's cash registers"
    ON cash_registers FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Only manager/owner can open register
CREATE POLICY "Manager/owner can open cash registers"
    ON cash_registers FOR INSERT
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Only manager/owner can close register
CREATE POLICY "Manager/owner can close cash registers"
    ON cash_registers FOR UPDATE
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- ============================================
-- 12.17 CASH TRANSACTIONS POLICIES
-- ============================================
-- Only manager/owner can view
CREATE POLICY "Staff can view their restaurant's cash transactions"
    ON cash_transactions FOR SELECT
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('owner', 'manager')
        )
    );

-- Only manager/owner can insert
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
-- SECTION 13: PERMISSIONS
-- ============================================

-- Grant permissions to service_role (for API routes with service key)
-- Note: service_role bypasses RLS but still needs table-level GRANT
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users (for RLS policies to work)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only permissions to anon (for public access via RLS)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Ensure future tables inherit these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- ============================================
-- END OF CONSOLIDATED MIGRATION
-- ============================================
