import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = "aws-0-ap-northeast-2.pooler.supabase.com";
const port = 6543;
const user = "postgres.xhgxmsgsxqpffzmpehtn";
const password = process.env.SUPABASE_DB_PASSWORD || "";
const database = "postgres";

async function runMigration() {
  const sqlPath = path.resolve(__dirname, "../supabase/unified_schema_v2.sql");
  console.log(`[MIGRATION] Reading SQL from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log(`[MIGRATION] Connecting to ${host}:${port} as ${user}...`);
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("[MIGRATION] Connected successfully to Supabase PostgreSQL!");
    console.log("[MIGRATION] Executing Unified Schema V2...");
    await client.query(sql);
    console.log("[MIGRATION] Schema executed successfully!");

    // Verify all created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("[MIGRATION] Verified Public Tables in Supabase:");
    console.log(res.rows.map(r => `  - ${r.table_name}`).join("\n"));

    // Verify demo profiles
    const profilesRes = await client.query(`SELECT email, role, is_demo_user FROM public.profiles;`);
    console.log("[MIGRATION] Verified Profiles:", profilesRes.rows);

    // Verify constraints and indexes count
    const idxRes = await client.query(`
      SELECT count(*) as total_indexes 
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `);
    console.log("[MIGRATION] Verified Public Indexes Count:", idxRes.rows[0].total_indexes);

  } catch (err) {
    console.error("[MIGRATION ERROR]", err);
    process.exit(1);
  } finally {
    await client.end();
    console.log("[MIGRATION] Connection closed.");
  }
}

runMigration();
