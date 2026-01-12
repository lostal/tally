-- ============================================
-- MIGRATION: Optimistic Locking for Bill Splitting
-- Version: 003
-- Description: Add version fields for race condition protection
-- ============================================

-- Add version column to order_items for optimistic locking
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES participants(id),
ADD COLUMN IF NOT EXISTS claimed_quantity INTEGER DEFAULT 0;

COMMENT ON COLUMN order_items.version IS 'Version for optimistic locking - increment on each update';
COMMENT ON COLUMN order_items.claimed_by IS 'Participant who claimed this item';
COMMENT ON COLUMN order_items.claimed_quantity IS 'How many of this item are claimed';

-- Add version to participants for sync
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ============================================
-- FUNCTION: Claim item with optimistic lock
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
-- FUNCTION: Release item claim
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
