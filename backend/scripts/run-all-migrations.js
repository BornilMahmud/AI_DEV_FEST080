import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = "aws-0-ap-southeast-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.xhgxmsgsxqpffzmpehtn";
const password = process.env.SUPABASE_DB_PASSWORD || "";

async function run() {
  console.log(`Connecting to Supabase PostgreSQL at ${host}:${port} as ${user}...`);
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

    // 1. Initial Schema
    const sql1Path = path.resolve(__dirname, "../supabase/migrations/20260301000000_initial_schema.sql");
    const sql1 = fs.readFileSync(sql1Path, "utf-8");
    console.log("Applying Migration 1 (Initial Schema)...");
    await client.query(sql1);
    console.log("Migration 1 completed!");

    // 2. Copilot & Behavior Schema
    const sql2Path = path.resolve(__dirname, "../supabase/migrations/20260301000001_copilot_behavior_schema.sql");
    const sql2 = fs.readFileSync(sql2Path, "utf-8");
    console.log("Applying Migration 2 (Copilot & Behavior Schema)...");
    await client.query(sql2);
    console.log("Migration 2 completed!");

    // 3. Alerts and Network tables (to ensure 100% full schema coverage)
    const extraSql = `
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

    ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Alerts accessible" ON alerts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
    CREATE POLICY "Audit logs readable" ON audit_logs FOR SELECT TO authenticated, anon USING (true);
    CREATE POLICY "Audit logs insertable" ON audit_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
    `;
    console.log("Applying Extra Entities (Alerts, Audit Logs)...");
    await client.query(extraSql);

    // Verify all created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("SUCCESS! Verified Public Tables in Supabase:", res.rows.map(r => r.table_name));

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
