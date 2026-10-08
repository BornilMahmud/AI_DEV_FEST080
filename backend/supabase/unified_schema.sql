-- ==============================================================================
-- upay Sentinel: Complete Consolidated Schema for Supabase PostgreSQL
-- Project: upay Sentinel AI Fraud Intelligence Platform (AI DEV FEST 2026)
-- Target Database: https://xhgxmsgsxqpffzmpehtn.supabase.co
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('investigator', 'analyst', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE txn_type AS ENUM ('send_money', 'merchant_payment', 'cash_out', 'bill_payment', 'recharge');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE txn_status AS ENUM ('completed', 'pending', 'held', 'blocked', 'under_review');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE inv_status AS ENUM ('open', 'investigating', 'resolved', 'escalated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE inv_decision AS ENUM ('approved', 'held', 'blocked', 'false_positive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES (Mirrors Firebase Authenticated Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'investigator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference TEXT UNIQUE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_phone_masked TEXT NOT NULL,
    receiver_name TEXT NOT NULL,
    receiver_phone_masked TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BDT',
    transaction_type txn_type NOT NULL DEFAULT 'send_money',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_id TEXT NOT NULL,
    device_new BOOLEAN NOT NULL DEFAULT false,
    location TEXT NOT NULL,
    beneficiary_new BOOLEAN NOT NULL DEFAULT false,
    ip_risk NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    transaction_status txn_status NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TRANSACTION FEATURES
CREATE TABLE IF NOT EXISTS transaction_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    amount_deviation NUMERIC(8,2) NOT NULL DEFAULT 1.0,
    velocity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    time_anomaly_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    device_anomaly_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    location_anomaly_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    beneficiary_anomaly_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    historical_behavior_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    failed_attempt_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    account_age_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. RISK ASSESSMENTS
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    fraud_score NUMERIC(5,2) NOT NULL,
    anomaly_score NUMERIC(5,2) NOT NULL,
    account_risk_score NUMERIC(5,2) NOT NULL,
    behavior_score NUMERIC(5,2) DEFAULT 0.00,
    contextual_score NUMERIC(5,2) DEFAULT 0.00,
    final_risk_score NUMERIC(5,2) NOT NULL,
    risk_level risk_severity NOT NULL,
    confidence NUMERIC(5,2) NOT NULL,
    model_version TEXT NOT NULL DEFAULT 'v1.4.2-sentinel-fusion',
    explanation_summary TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. RISK FACTORS
CREATE TABLE IF NOT EXISTS risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    factor_code TEXT NOT NULL,
    factor_name TEXT NOT NULL,
    description TEXT NOT NULL,
    contribution NUMERIC(5,2) NOT NULL,
    severity risk_severity NOT NULL,
    evidence TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. CUSTOMER BEHAVIOR PROFILES
CREATE TABLE IF NOT EXISTS customer_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_identifier TEXT UNIQUE NOT NULL,
    average_amount NUMERIC(12,2) NOT NULL DEFAULT 2100.00,
    median_amount NUMERIC(12,2) NOT NULL DEFAULT 1800.00,
    transaction_count_daily NUMERIC(5,2) NOT NULL DEFAULT 2.5,
    normal_transaction_start_hour INT NOT NULL DEFAULT 8,
    normal_transaction_end_hour INT NOT NULL DEFAULT 22,
    known_device_count INT NOT NULL DEFAULT 1,
    known_beneficiary_count INT NOT NULL DEFAULT 4,
    typical_location TEXT NOT NULL DEFAULT 'Dhaka',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time_ago TEXT,
    icon_type TEXT DEFAULT 'activity',
    confidence NUMERIC(5,2) DEFAULT 88,
    related_id TEXT,
    unread BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. INVESTIGATIONS
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status inv_status NOT NULL DEFAULT 'open',
    priority risk_severity NOT NULL DEFAULT 'medium',
    investigator_notes TEXT,
    final_decision inv_decision,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 11. INVESTIGATION ACTIONS / AUDIT LOG
CREATE TABLE IF NOT EXISTS investigation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    action_type TEXT NOT NULL,
    action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. IMMUTABLE SYSTEM AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    request_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (transaction_status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions (transaction_reference);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_txn ON risk_assessments (transaction_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score ON risk_assessments (final_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customer_behavior_id ON customer_behavior_profiles (customer_identifier);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);

-- 14. ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo & operations
CREATE POLICY "Profiles accessible" ON profiles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Transactions accessible" ON transactions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Features accessible" ON transaction_features FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Risk assessments accessible" ON risk_assessments FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Risk factors accessible" ON risk_factors FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Behavior profiles accessible" ON customer_behavior_profiles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Alerts accessible" ON alerts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Investigations accessible" ON investigations FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "Investigation actions readable" ON investigation_actions FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Investigation actions insertable" ON investigation_actions FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Audit logs readable" ON audit_logs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Audit logs insertable" ON audit_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
