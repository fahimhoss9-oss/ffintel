const SETUP_MESSAGE =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file (see .env.example for guidance).";

/**
 * Reads Supabase env config lazily (at call time, never at import time).
 * Throws a friendly error when the keys are missing.
 */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error(SETUP_MESSAGE);
  return { url, anonKey };
}
