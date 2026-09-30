import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./supabase-env";

/**
 * Client-side Supabase client for use in Client Components ("use client" files).
 * Browser-safe: never touches next/headers.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
