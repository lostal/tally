-- ============================================
-- MIGRATION: Fix Users RLS Policy
-- Version: 004
-- Description: Allow users to read their own profile data
-- ============================================

-- Enable RLS (already enabled in 001, but safe to repeat)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile based on auth_id
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth_id = auth.uid());

-- Allow users to update their own profile (optional, but good practice)
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth_id = auth.uid());

-- Allow service role full access (implicit, but documented)
-- Service role always bypasses RLS
