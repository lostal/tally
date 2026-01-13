-- ============================================
-- Migration 006: Onboarding RLS Policies
-- ============================================
-- Adds INSERT policies needed for user onboarding flow

-- Allow authenticated users to create their own restaurant
CREATE POLICY "Authenticated users can create restaurant" ON restaurants
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_auth_id = auth.uid());

-- Allow users to update their own restaurant
CREATE POLICY "Owners can update their restaurant" ON restaurants
    FOR UPDATE
    USING (owner_auth_id = auth.uid());

-- Allow authenticated users to create their own user profile
CREATE POLICY "Authenticated users can create own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth_id = auth.uid());

-- Allow restaurant owners to create subscriptions for their restaurant
CREATE POLICY "Owners can create subscriptions" ON subscriptions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Allow owners to view their subscriptions
CREATE POLICY "Owners can view their subscriptions" ON subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Allow owners to update their subscriptions
CREATE POLICY "Owners can update their subscriptions" ON subscriptions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Allow owners to create tables for their restaurant
CREATE POLICY "Owners can create tables" ON tables
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

-- Allow owners to manage their tables (SELECT, UPDATE, DELETE)
CREATE POLICY "Owners can view their tables" ON tables
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their tables" ON tables
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete their tables" ON tables
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE id = restaurant_id
            AND owner_auth_id = auth.uid()
        )
    );
