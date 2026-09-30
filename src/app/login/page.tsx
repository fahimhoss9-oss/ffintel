"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Card, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

function errorMessage(code: string | null): string | null {
  switch (code) {
    case "not-admin":
      return "That email is not authorized for admin access.";
    case "callback-failed":
      return "The sign-in link didn't work. Please request a new one.";
    case "not-configured":
      return "Sign-in isn't configured yet. Add your Supabase keys to .env (see .env.example).";
    default:
      return null;
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage(searchParams.get("error")));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (otpError) throw otpError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center px-4 py-12">
      <Card className="w-full p-6 sm:p-8">
        <SectionTitle
          title="Sign in"
          subtitle="Enter your email and we'll send you a secure sign-in link. No password needed."
        />
        {sent ? (
          <div className="rounded-lg bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200 ring-1 ring-inset ring-emerald-500/30">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1 text-emerald-200/80">
              We sent a sign-in link to <span className="font-semibold">{email}</span>. Open it on
              this device to continue.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-300">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg bg-arena-800 px-3 py-2.5 text-sm text-zinc-100 ring-1 ring-arena-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-inset ring-red-500/30">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-bold text-arena-950 hover:bg-accent-400 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
            <p className="text-center text-xs text-zinc-500">
              Admin access is limited to emails listed in ADMIN_EMAILS.
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
