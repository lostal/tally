-- ============================================
-- MIGRATION: Add Tax/Fiscal Fields
-- Version: 002
-- Description: Add VAT rate to products and fiscal invoice structure
-- ============================================

-- Add tax_rate to products (Spanish hospitality VAT = 10%)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(4,2) DEFAULT 10.00;

COMMENT ON COLUMN products.tax_rate IS 'VAT rate as percentage (e.g. 10.00 for 10%). Spanish hospitality default.';

-- ============================================
-- RESTAURANTS: Add fiscal information
-- ============================================
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS fiscal_name TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT, -- CIF/NIF
ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
ADD COLUMN IF NOT EXISTS fiscal_city TEXT,
ADD COLUMN IF NOT EXISTS fiscal_postal_code TEXT,
ADD COLUMN IF NOT EXISTS fiscal_country TEXT DEFAULT 'ES';

COMMENT ON COLUMN restaurants.tax_id IS 'CIF/NIF for fiscal invoices';
COMMENT ON COLUMN restaurants.fiscal_name IS 'Legal business name for invoices';

-- ============================================
-- INVOICES: Fiscal invoice table
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
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

    -- Verifactu compliance (Phase 2)
    hash TEXT, -- SHA-256 hash for chain integrity
    previous_hash TEXT, -- Link to previous invoice hash
    qr_code TEXT, -- QR code data for verification

    -- Timestamps
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint on restaurant + series + number
    UNIQUE(restaurant_id, series, invoice_number)
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant ON invoices(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(restaurant_id, series, invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_issued ON invoices(restaurant_id, issued_at);

-- ============================================
-- INVOICE ITEMS: Line items for invoices
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
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

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- SEQUENCE for invoice numbering
-- ============================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Function to generate next invoice number
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
