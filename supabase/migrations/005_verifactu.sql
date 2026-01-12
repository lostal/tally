-- ============================================
-- MIGRATION: Verifactu Compliance
-- Version: 005
-- Description: Add hash chaining and soft delete for fiscal compliance
-- ============================================

-- ============================================
-- 1. ADD HASH CHAIN COLUMNS (if not present)
-- ============================================
-- Already have hash and previous_hash from 002, ensure they exist
DO $$
BEGIN
    -- Check if columns exist, add if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'hash') THEN
        ALTER TABLE invoices ADD COLUMN hash TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'invoices' AND column_name = 'previous_hash') THEN
        ALTER TABLE invoices ADD COLUMN previous_hash TEXT;
    END IF;
END $$;

-- ============================================
-- 2. SOFT DELETE SUPPORT
-- ============================================
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp - invoices are never physically deleted per Verifactu';

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- 3. HASH GENERATION FUNCTION
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
-- 4. TRIGGER: Auto-hash on insert
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

DROP TRIGGER IF EXISTS tr_invoice_hash ON invoices;
CREATE TRIGGER tr_invoice_hash
AFTER INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION trigger_hash_invoice();

-- ============================================
-- 5. PREVENT PHYSICAL DELETE
-- ============================================
CREATE OR REPLACE FUNCTION prevent_invoice_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Invoices cannot be deleted per Verifactu compliance. Use soft delete (UPDATE deleted_at) instead.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_invoice_delete ON invoices;
CREATE TRIGGER tr_prevent_invoice_delete
BEFORE DELETE ON invoices
FOR EACH ROW
EXECUTE FUNCTION prevent_invoice_delete();

-- ============================================
-- 6. QR CODE DATA GENERATION
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_qr_data(p_invoice_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_invoice RECORD;
    v_restaurant RECORD;
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
    -- Real format would follow AEAT specifications
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
