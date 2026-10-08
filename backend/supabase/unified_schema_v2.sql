-- ==============================================================================
-- UPAY SENTINEL — AUTHORITATIVE PRODUCTION DATABASE SCHEMA (V2)
-- Mobile Financial Services (MFS) Fraud & Security Intelligence
-- Includes: Profiles, Auth Sync, Login Sessions, Login IP History, Security Events,
--           Customers, Transactions, Risk Assessments, Alerts, Cases, Audit Events
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked with Firebase Auth UID & Role Management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'ANALYST' CHECK (role IN ('ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER')),
    avatar_url TEXT,
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'LOCKED')),
    is_demo_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(64),
    last_login_user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 3. LOGIN SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL,
    login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    ip_address VARCHAR(64) NOT NULL,
    user_agent TEXT,
    device_fingerprint VARCHAR(128),
    auth_provider VARCHAR(64) DEFAULT 'firebase',
    session_status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (session_status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
    request_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON public.login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_firebase_uid ON public.login_sessions(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_login_sessions_login_at ON public.login_sessions(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_sessions_ip ON public.login_sessions(ip_address);

-- ------------------------------------------------------------------------------
-- 4. LOGIN IP HISTORY TABLE (Tracks Observed Public IP & Changes Per User)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_ip_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    firebase_uid VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    login_count INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    is_new_ip BOOLEAN NOT NULL DEFAULT TRUE,
    previous_ip VARCHAR(64),
    change_detected BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT,
    device_fingerprint VARCHAR(128),
    country_code VARCHAR(8),      -- Nullable: Observed IP only, no fake physical location
    region VARCHAR(64),            -- Nullable: Approximate regional telemetry if available
    city VARCHAR(64),              -- Nullable
    asn VARCHAR(64),               -- Nullable
    isp VARCHAR(128),              -- Nullable
    risk_level VARCHAR(32) NOT NULL DEFAULT 'NORMAL' CHECK (risk_level IN ('NORMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_ip_history_user_id ON public.login_ip_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_ip_history_firebase_uid ON public.login_ip_history(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_login_ip_history_ip ON public.login_ip_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_ip_history_last_seen ON public.login_ip_history(last_seen_at DESC);

-- ------------------------------------------------------------------------------
-- 5. SECURITY EVENTS TABLE (Authentication & Context Anomaly Audit)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    firebase_uid VARCHAR(128),
    event_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(64),
    user_agent TEXT,
    device_fingerprint VARCHAR(128),
    risk_level VARCHAR(32) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('NORMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT NOT NULL,
    request_id VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_risk ON public.security_events(risk_level);

-- ------------------------------------------------------------------------------
-- 6. CUSTOMERS TABLE (MFS Customer 360 Risk Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    kyc_tier VARCHAR(32) DEFAULT 'Tier-2 (National ID Verified)',
    risk_score INT NOT NULL DEFAULT 15,
    risk_level VARCHAR(32) NOT NULL DEFAULT 'Low',
    typical_hours VARCHAR(64) DEFAULT '09:00 - 22:00',
    account_age VARCHAR(32) DEFAULT '1y 0m',
    total_volume NUMERIC(15, 2) DEFAULT 0.00,
    avg_transaction NUMERIC(15, 2) DEFAULT 2200.00,
    known_devices JSONB DEFAULT '[]'::jsonb,
    known_locations JSONB DEFAULT '[]'::jsonb,
    recent_deviations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_risk_level ON public.customers(risk_level);

-- ------------------------------------------------------------------------------
-- 7. TRANSACTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_reference VARCHAR(64) UNIQUE NOT NULL,
    sender_name VARCHAR(128) NOT NULL,
    sender_phone_masked VARCHAR(32),
    receiver_name VARCHAR(128) NOT NULL,
    receiver_phone_masked VARCHAR(32),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
    transaction_type VARCHAR(64) NOT NULL DEFAULT 'send_money',
    device_id VARCHAR(64),
    device_new BOOLEAN DEFAULT FALSE,
    location VARCHAR(128) DEFAULT 'Dhaka',
    beneficiary_new BOOLEAN DEFAULT FALSE,
    ip_risk INT DEFAULT 10,
    transaction_status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (transaction_status IN ('completed', 'held', 'under_review', 'blocked', 'reversed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON public.transactions(sender_name);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON public.transactions(receiver_name);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions(amount);

-- ------------------------------------------------------------------------------
-- 8. RISK ASSESSMENTS TABLE (Authoritative Risk Fusion Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(64) REFERENCES public.transactions(id) ON DELETE CASCADE,
    final_score INT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    confidence INT NOT NULL DEFAULT 95,
    deterministic_score INT,
    ml_score INT,
    factors JSONB DEFAULT '[]'::jsonb,
    rules_hit JSONB DEFAULT '[]'::jsonb,
    ml_prediction JSONB DEFAULT '{}'::jsonb,
    recommended_actions JSONB DEFAULT '[]'::jsonb,
    explanation TEXT NOT NULL,
    scoring_version VARCHAR(64) NOT NULL DEFAULT 'v1.4.2-sentinel-fusion-py',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_txn ON public.risk_assessments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON public.risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score ON public.risk_assessments(final_score DESC);

-- ------------------------------------------------------------------------------
-- 9. ALERTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id VARCHAR(64) PRIMARY KEY,
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence INT DEFAULT 90,
    related_transaction_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'DISMISSED')),
    unread BOOLEAN DEFAULT TRUE,
    assigned_analyst VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);

-- ------------------------------------------------------------------------------
-- 10. INVESTIGATION CASES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investigation_cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    customer_id VARCHAR(64),
    risk_level VARCHAR(32) NOT NULL DEFAULT 'High',
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'PENDING_REVIEW', 'ESCALATED', 'RESOLVED', 'DISMISSED')),
    priority VARCHAR(32) NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_analyst VARCHAR(128) DEFAULT 'Arman Hossen',
    notes TEXT,
    findings TEXT,
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON public.investigation_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_customer ON public.investigation_cases(customer_id);

-- ------------------------------------------------------------------------------
-- 11. CASE NOTES & EVIDENCE TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(64) REFERENCES public.investigation_cases(id) ON DELETE CASCADE,
    author VARCHAR(128) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(64) REFERENCES public.investigation_cases(id) ON DELETE CASCADE,
    evidence_type VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. NETWORK NODES & EDGES (Graph Intelligence)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.network_nodes (
    id VARCHAR(64) PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    node_type VARCHAR(32) NOT NULL,
    risk_level VARCHAR(32) DEFAULT 'Low',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.network_edges (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(64) NOT NULL,
    target VARCHAR(64) NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    is_hot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. AUDIT EVENTS TABLE (Immutable Append-Only Audit Stream)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_events (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(128) NOT NULL,
    actor_role VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    action VARCHAR(128) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    previous_state JSONB,
    new_state JSONB,
    reason TEXT NOT NULL,
    request_id VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON public.audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON public.audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON public.audit_events(entity, entity_id);

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_ip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full administrative access
DROP POLICY IF EXISTS service_role_all_profiles ON public.profiles;
CREATE POLICY service_role_all_profiles ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_sessions ON public.login_sessions;
CREATE POLICY service_role_all_sessions ON public.login_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_ip_history ON public.login_ip_history;
CREATE POLICY service_role_all_ip_history ON public.login_ip_history FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_security ON public.security_events;
CREATE POLICY service_role_all_security ON public.security_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_txns ON public.transactions;
CREATE POLICY service_role_all_txns ON public.transactions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_alerts ON public.alerts;
CREATE POLICY service_role_all_alerts ON public.alerts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_audit ON public.audit_events;
CREATE POLICY service_role_all_audit ON public.audit_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Disallow updates/deletions on audit_events to guarantee immutability
DROP POLICY IF EXISTS no_audit_updates ON public.audit_events;
CREATE POLICY no_audit_updates ON public.audit_events FOR UPDATE USING (false);

DROP POLICY IF EXISTS no_audit_deletions ON public.audit_events;
CREATE POLICY no_audit_deletions ON public.audit_events FOR DELETE USING (false);

-- ------------------------------------------------------------------------------
-- 15. SEED SAFE DEMO PROFILES (Hackathon Judges & Investigators)
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (firebase_uid, email, display_name, role, is_demo_user, account_status)
VALUES
    ('demo-judge-01', 'judge@upay.com.bd', 'Chief Judge / Auditor', 'ADMIN', TRUE, 'ACTIVE'),
    ('demo-arman-01', 'arman.hossen@upay.com.bd', 'Arman Hossen (Lead Fraud Investigator)', 'ANALYST', TRUE, 'ACTIVE'),
    ('demo-siam-01', 'siam.ahmed@upay.com.bd', 'Siam Ahmed (Senior Intelligence Analyst)', 'INVESTIGATOR', TRUE, 'ACTIVE'),
    ('demo-viewer-01', 'viewer@upay.com.bd', 'BFIU Regulatory Observer', 'VIEWER', TRUE, 'ACTIVE')
ON CONFLICT (firebase_uid) DO UPDATE
SET display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Pre-seed core sample customer
INSERT INTO public.customers (id, name, phone, kyc_tier, risk_score, risk_level, total_volume, known_devices, known_locations)
VALUES
    ('U-1042', 'Tanvir Ahmed', '+880 1711 000104', 'Tier-2 (NID Verified)', 94, 'Critical', 1420000, '["DEV-PRIMARY-SAMSUNG", "DEV-SECONDARY-IPHONE"]'::jsonb, '["Dhaka", "Chattogram"]'::jsonb),
    ('U-2214', 'Kamal Hossain', '+880 1912 000214', 'Tier-1 (Basic)', 87, 'High', 640000, '["DEV-1049"]'::jsonb, '["Chattogram"]'::jsonb),
    ('U-4421', 'Mahmud Hasan', '+880 1513 000421', 'Tier-2 (NID Verified)', 98, 'Critical', 2890000, '["DEV-3312"]'::jsonb, '["Sylhet"]'::jsonb),
    ('U-5501', 'Sadia Rahman', '+880 1714 000501', 'Tier-2 (NID Verified)', 14, 'Low', 180000, '["DEV-5501"]'::jsonb, '["Dhaka"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
