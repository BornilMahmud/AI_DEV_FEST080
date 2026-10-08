import { createClient } from "@supabase/supabase-js";

export const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://xhgxmsgsxqpffzmpehtn.supabase.co";

export const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
