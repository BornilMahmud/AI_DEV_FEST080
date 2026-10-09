import { createClient } from "@supabase/supabase-js";
import type { FirebaseUser } from "./firebase";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xhgxmsgsxqpffzmpehtn.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_AW3O9YE91ne_eg66F4et9g_U7w3crxi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/**
 * Authoritatively syncs an authenticated Firebase user through the Express Backend
 * Flow:
 * Firebase ID Token -> Backend /api/v1/auth/session -> Supabase Profiles -> Login Session -> Login IP History
 */
export async function syncFirebaseUserToSupabase(
  user: FirebaseUser,
  role: "customer" | "investigator" | "analyst" | "admin" = "customer"
) {
  try {
    // 1. Obtain verified Firebase ID token
    const idToken = typeof user.getIdToken === "function" ? await user.getIdToken() : null;

    if (idToken) {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      try {
        const response = await fetch(`${backendUrl}/api/v1/auth/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            role: role.toUpperCase(),
            deviceFingerprint: typeof window !== "undefined" ? window.navigator.userAgent : "browser",
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("[Sentinel Auth Sync] Backend session & IP history verified:", result);
          return { success: true, user: result.user, wallet: result.wallet, session: result.session, token: idToken };
        }
      } catch (backendErr: any) {
        console.warn("[Sentinel Auth Sync] Backend sync notice, using client fallback:", backendErr.message);
      }
    }

    // 2. Direct client fallback to Supabase if backend is unreachable
    const payload = {
      firebase_uid: user.uid,
      email: user.email || "",
      display_name: user.displayName || user.email?.split("@")[0] || "Authorized Analyst",
      avatar_url: user.photoURL || null,
      role: role.toUpperCase(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "firebase_uid" })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[Supabase Sync] Profile table sync note:", error.message);
    } else {
      console.log("[Supabase Sync] Profile successfully synchronized to Supabase:", data);
    }
    return { success: !error, data };
  } catch (err: any) {
    console.warn("[Supabase Sync] Sync caught non-blocking exception:", err.message);
    return { success: false, error: err.message };
  }
}
