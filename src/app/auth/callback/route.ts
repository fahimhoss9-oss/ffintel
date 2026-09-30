import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

/**
 * Handles the Supabase magic-link redirect: exchanges the `code` for a
 * session, then sends the user on to `?next=` (default /admin).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    } catch {
      // fall through to the error redirect below
    }
  }
  return NextResponse.redirect(new URL("/login?error=callback-failed", url.origin));
}
