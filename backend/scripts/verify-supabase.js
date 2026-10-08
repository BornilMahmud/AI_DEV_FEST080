import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://xhgxmsgsxqpffzmpehtn.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "your_supabase_key";
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("Verifying PostgREST queries on Supabase...");
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles?.length, "error:", pErr?.message || null);

  const { data: cust, error: cErr } = await supabase.from("customers").select("*");
  console.log("Customers count:", cust?.length, "error:", cErr?.message || null);

  const { data: sessions, error: sErr } = await supabase.from("login_sessions").select("*");
  console.log("Login Sessions count:", sessions?.length, "error:", sErr?.message || null);

  const { data: ipHist, error: ipErr } = await supabase.from("login_ip_history").select("*");
  console.log("Login IP History count:", ipHist?.length, "error:", ipErr?.message || null);

  const { data: secEvents, error: secErr } = await supabase.from("security_events").select("*");
  console.log("Security Events count:", secEvents?.length, "error:", secErr?.message || null);

  const { data: txns, error: tErr } = await supabase.from("transactions").select("*");
  console.log("Transactions count:", txns?.length, "error:", tErr?.message || null);

  const { data: alerts, error: aErr } = await supabase.from("alerts").select("*");
  console.log("Alerts count:", alerts?.length, "error:", aErr?.message || null);

  const { data: audits, error: auErr } = await supabase.from("audit_events").select("*");
  console.log("Audit Events count:", audits?.length, "error:", auErr?.message || null);
}

verify();
