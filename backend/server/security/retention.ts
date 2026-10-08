import { SupabaseClient } from "@supabase/supabase-js";

export interface RetentionPolicyConfig {
  loginSessionRetentionDays: number;
  ipHistoryRetentionDays: number;
  securityEventRetentionDays: number;
}

export function getRetentionConfig(): RetentionPolicyConfig {
  return {
    loginSessionRetentionDays: parseInt(process.env.LOGIN_SESSION_RETENTION_DAYS || "90", 10),
    ipHistoryRetentionDays: parseInt(process.env.IP_HISTORY_RETENTION_DAYS || "180", 10),
    securityEventRetentionDays: parseInt(process.env.SECURITY_EVENT_RETENTION_DAYS || "365", 10),
  };
}

/**
 * Runs configurable data retention pruning for non-audit security telemetry.
 * NOTE: audit_events are strictly immutable and never automatically deleted.
 */
export async function pruneExpiredSecurityData(supabase: SupabaseClient) {
  const config = getRetentionConfig();
  const results = {
    sessionsPruned: 0,
    ipHistoryPruned: 0,
    securityEventsPruned: 0,
  };

  try {
    const sessionCutoff = new Date(Date.now() - config.loginSessionRetentionDays * 86400 * 1000).toISOString();
    const { count: sCount, error: sErr } = await supabase
      .from("login_sessions")
      .delete({ count: "exact" })
      .lt("login_at", sessionCutoff);
    if (!sErr && sCount !== null) results.sessionsPruned = sCount;

    const eventCutoff = new Date(Date.now() - config.securityEventRetentionDays * 86400 * 1000).toISOString();
    const { count: eCount, error: eErr } = await supabase
      .from("security_events")
      .delete({ count: "exact" })
      .lt("created_at", eventCutoff);
    if (!eErr && eCount !== null) results.securityEventsPruned = eCount;

    console.log(`[Retention Job] Pruning complete:`, results);
  } catch (err: any) {
    console.error("[Retention Job] Pruning encountered error:", err.message);
  }

  return results;
}
