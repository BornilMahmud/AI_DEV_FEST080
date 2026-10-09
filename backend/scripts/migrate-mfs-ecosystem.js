import pg from "pg";

const host = "aws-0-ap-northeast-2.pooler.supabase.com";
const port = 6543;
const user = "postgres.xhgxmsgsxqpffzmpehtn";
const password = process.env.SUPABASE_DB_PASSWORD || "LnFGZQ2J2cx.i_9";

async function run() {
  console.log(`Connecting to Supabase PostgreSQL at ${host}:${port}...`);
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("Connected successfully to Supabase PostgreSQL!");

    const migrationSql = `
    -- 1. Wallets Table
    CREATE TABLE IF NOT EXISTS public.wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        customer_id VARCHAR(64),
        balance NUMERIC(15, 2) NOT NULL DEFAULT 45250.00,
        currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FROZEN', 'RESTRICTED')),
        daily_limit NUMERIC(15, 2) DEFAULT 100000.00,
        monthly_limit NUMERIC(15, 2) DEFAULT 500000.00,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
    CREATE INDEX IF NOT EXISTS idx_wallets_customer_id ON public.wallets(customer_id);

    -- 2. Beneficiaries / Saved Recipients
    CREATE TABLE IF NOT EXISTS public.beneficiaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        service_type VARCHAR(64) NOT NULL DEFAULT 'send_money',
        nickname VARCHAR(64),
        avatar VARCHAR(8) DEFAULT 'UP',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_beneficiaries_user ON public.beneficiaries(user_id);

    -- 3. User Devices (Normalized Device Intelligence)
    CREATE TABLE IF NOT EXISTS public.user_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        firebase_uid VARCHAR(128) NOT NULL,
        device_id VARCHAR(128) NOT NULL,
        browser VARCHAR(64),
        operating_system VARCHAR(64),
        device_class VARCHAR(32) DEFAULT 'Desktop',
        user_agent TEXT,
        ip_address VARCHAR(64),
        first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        is_trusted BOOLEAN DEFAULT TRUE,
        status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPICIOUS', 'BLOCKED')),
        session_count INT DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_user_devices_uid ON public.user_devices(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_devices_dev ON public.user_devices(device_id);

    -- 4. ML Models Registry
    CREATE TABLE IF NOT EXISTS public.ml_models (
        id VARCHAR(64) PRIMARY KEY,
        model_version VARCHAR(64) NOT NULL,
        model_type VARCHAR(64) NOT NULL,
        feature_version VARCHAR(32) NOT NULL DEFAULT 'v2.1',
        dataset_version VARCHAR(32) NOT NULL DEFAULT 'PaySim-BD-v1.4',
        training_samples INT NOT NULL DEFAULT 6362620,
        fraud_samples INT NOT NULL DEFAULT 8213,
        precision NUMERIC(5, 4) NOT NULL DEFAULT 0.9842,
        recall NUMERIC(5, 4) NOT NULL DEFAULT 0.9615,
        f1 NUMERIC(5, 4) NOT NULL DEFAULT 0.9727,
        pr_auc NUMERIC(5, 4) NOT NULL DEFAULT 0.9780,
        roc_auc NUMERIC(5, 4) NOT NULL DEFAULT 0.9984,
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'STAGED', 'RETIRED')),
        trained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deployed_at TIMESTAMPTZ,
        deployed_by VARCHAR(128) DEFAULT 'System Architect',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 5. Datasets Governance Table
    CREATE TABLE IF NOT EXISTS public.datasets (
        id VARCHAR(64) PRIMARY KEY,
        dataset_version VARCHAR(64) NOT NULL,
        source_name VARCHAR(128) NOT NULL,
        transaction_count INT NOT NULL DEFAULT 6362620,
        customer_count INT NOT NULL DEFAULT 428000,
        fraud_count INT NOT NULL DEFAULT 8213,
        fraud_ratio NUMERIC(5, 4) NOT NULL DEFAULT 0.0013,
        train_split NUMERIC(4, 2) DEFAULT 0.70,
        val_split NUMERIC(4, 2) DEFAULT 0.15,
        test_split NUMERIC(4, 2) DEFAULT 0.15,
        leakage_validated BOOLEAN NOT NULL DEFAULT TRUE,
        is_synthetic BOOLEAN NOT NULL DEFAULT TRUE,
        features JSONB DEFAULT '["amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest", "velocity_1h", "device_trust", "location_delta"]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 6. Risk Policies & Configuration
    CREATE TABLE IF NOT EXISTS public.risk_policies (
        id VARCHAR(64) PRIMARY KEY,
        policy_key VARCHAR(64) UNIQUE NOT NULL,
        policy_name VARCHAR(128) NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'threshold',
        description TEXT,
        last_modified_by VARCHAR(128) DEFAULT 'Chief Risk Officer',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 7. Enable RLS and setup policies
    ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.risk_policies ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS service_role_all_wallets ON public.wallets;
    CREATE POLICY service_role_all_wallets ON public.wallets FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS service_role_all_beneficiaries ON public.beneficiaries;
    CREATE POLICY service_role_all_beneficiaries ON public.beneficiaries FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS service_role_all_devices ON public.user_devices;
    CREATE POLICY service_role_all_devices ON public.user_devices FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS service_role_all_ml_models ON public.ml_models;
    CREATE POLICY service_role_all_ml_models ON public.ml_models FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS service_role_all_datasets ON public.datasets;
    CREATE POLICY service_role_all_datasets ON public.datasets FOR ALL TO service_role USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS service_role_all_policies ON public.risk_policies;
    CREATE POLICY service_role_all_policies ON public.risk_policies FOR ALL TO service_role USING (true) WITH CHECK (true);

    -- Seed Initial ML Models
    INSERT INTO public.ml_models (id, model_version, model_type, feature_version, dataset_version, training_samples, fraud_samples, precision, recall, f1, pr_auc, roc_auc, status, deployed_at)
    VALUES
      ('MDL-XGB-2026-V2', 'v2.4.0-sentinel-xgb', 'Extreme Gradient Boosted Decision Forest', 'v2.1', 'PaySim-BD-v1.4', 6362620, 8213, 0.9842, 0.9615, 0.9727, 0.9780, 0.9984, 'ACTIVE', NOW()),
      ('MDL-IFOREST-2026-V1', 'v1.8.2-isolation-forest', 'Unsupervised Behavioral Anomaly Forest', 'v2.1', 'PaySim-BD-v1.4', 1200000, 2400, 0.9410, 0.9180, 0.9293, 0.9320, 0.9890, 'STAGED', NULL),
      ('MDL-LOGREG-2025-LEGACY', 'v1.0.0-baseline-logistic', 'L2 Penalized Logistic Regression', 'v1.0', 'PaySim-BD-v1.0', 500000, 1000, 0.8820, 0.8250, 0.8525, 0.8410, 0.9420, 'RETIRED', NULL)
    ON CONFLICT (id) DO NOTHING;

    -- Seed Datasets Metadata
    INSERT INTO public.datasets (id, dataset_version, source_name, transaction_count, customer_count, fraud_count, fraud_ratio, leakage_validated)
    VALUES
      ('DS-PAYSIM-BD-1.4', 'PaySim-BD-v1.4', 'PaySim Mobile Money Simulation (MFS Calibrated)', 6362620, 428000, 8213, 0.0013, TRUE),
      ('DS-BEHAVIORAL-HIST-2026', 'MFS-Behavioral-v2.0', 'Bangladesh MFS Synthetic Velocity & Device Clusters', 850000, 65000, 4120, 0.0048, TRUE)
    ON CONFLICT (id) DO NOTHING;

    -- Seed Risk Policies
    INSERT INTO public.risk_policies (id, policy_key, policy_name, value, category, description)
    VALUES
      ('POL-CRIT-THRESH', 'critical_threshold', 'Critical Risk Block Threshold', 90.00, 'threshold', 'Transactions with risk score equal or above 90 are automatically held/blocked'),
      ('POL-HIGH-THRESH', 'high_threshold', 'High Risk Step-Up 2FA Threshold', 75.00, 'threshold', 'Transactions with risk score equal or above 75 trigger mandatory OTP / biometric verification'),
      ('POL-MED-THRESH', 'medium_threshold', 'Medium Risk Monitoring Threshold', 50.00, 'threshold', 'Transactions flagged for enhanced background telemetry scrutiny'),
      ('POL-VEL-1H', 'velocity_limit_1h', 'Hourly Single-Account Transfer Velocity Limit', 5.00, 'velocity', 'Maximum number of rapid transfers per user within 60 minutes'),
      ('POL-MULE-WEIGHT', 'mule_cluster_weight', 'Graph Mule Network Risk Multiplier', 1.45, 'network', 'Multiplier applied when beneficiary is linked to hot mule edges')
    ON CONFLICT (id) DO NOTHING;
    `;

    console.log("Applying ecosystem migrations (wallets, beneficiaries, devices, ml_models, datasets, risk_policies)...");
    await client.query(migrationSql);
    console.log("Migration executed successfully!");

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("ALL TABLES NOW IN SUPABASE:", res.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

run();
