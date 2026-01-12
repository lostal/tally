-- ============================================
-- MIGRATION: SaaS Subscriptions
-- Version: 006
-- Description: Add subscription management for SaaS model
-- ============================================

-- ============================================
-- 1. SUBSCRIPTION PLANS ENUM
-- ============================================
CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Plan details
    plan subscription_plan NOT NULL DEFAULT 'starter',
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

-- Index for Stripe lookups
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 3. ADD OWNER TO RESTAURANTS
-- ============================================
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS owner_auth_id UUID,
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

-- Index for owner lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_auth_id);

-- ============================================
-- 4. PLAN LIMITS HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan subscription_plan)
RETURNS TABLE(max_tables INTEGER, max_users INTEGER, has_kds BOOLEAN, commission_rate DECIMAL) AS $$
BEGIN
    CASE p_plan
        WHEN 'starter' THEN
            RETURN QUERY SELECT 3, 1, false, 1.90::DECIMAL;
        WHEN 'pro' THEN
            RETURN QUERY SELECT 15, 5, true, 1.50::DECIMAL;
        WHEN 'business' THEN
            RETURN QUERY SELECT 999, 999, true, 1.20::DECIMAL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CHECK SUBSCRIPTION STATUS FUNCTION
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
-- 6. RLS POLICIES FOR SUBSCRIPTIONS
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Owners can view their subscription
CREATE POLICY "Restaurant owners can view subscription" ON subscriptions
    FOR SELECT
    USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_auth_id = auth.uid()
        )
    );

-- Only service role can modify (via Stripe webhooks)
-- No INSERT/UPDATE policy for regular users

-- ============================================
-- 7. UPDATE RLS ON RESTAURANTS FOR OWNER
-- ============================================
CREATE POLICY "Owners can view own restaurant" ON restaurants
    FOR SELECT
    USING (owner_auth_id = auth.uid() OR id IN (
        SELECT restaurant_id FROM users WHERE auth_id = auth.uid()
    ));

-- ============================================
-- 8. TRIGGER: Update subscription limits on plan change
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

CREATE TRIGGER tr_subscription_plan_change
BEFORE INSERT OR UPDATE OF plan ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_limits();
