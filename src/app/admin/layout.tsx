import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Card, SectionTitle } from "@/components/ui";
import { AdminNav, SignOutButton } from "./shared";

export const dynamic = "force-dynamic";

function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card className="p-6 sm:p-8">
        <SectionTitle
          title="Admin setup required"
          subtitle="The admin area needs a database and authentication before it can run."
        />
        <p className="text-sm text-zinc-400">Missing environment variables:</p>
        <ul className="mt-2 space-y-1">
          {missing.map((m) => (
            <li key={m} className="font-mono text-sm text-amber-300">
              {m}
            </li>
          ))}
        </ul>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>
            Create a free project at <span className="text-zinc-200">supabase.com</span> and copy
            your project URL, anon key, and Postgres connection string.
          </li>
          <li>
            Copy <span className="font-mono">.env.example</span> to{" "}
            <span className="font-mono">.env</span> and fill in the values, including your email in{" "}
            <span className="font-mono">ADMIN_EMAILS</span>.
          </li>
          <li>
            Run <span className="font-mono">npx prisma db push</span> and{" "}
            <span className="font-mono">npm run db:seed</span>, then restart the dev server.
          </li>
        </ol>
      </Card>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!process.env.ADMIN_EMAILS) missing.push("ADMIN_EMAILS");

  if (missing.length > 0) {
    return <SetupNotice missing={missing} />;
  }

  await requireAdmin(); // redirects to /login when not signed in or not an admin

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <div className="lg:sticky lg:top-20">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Admin</p>
            <SignOutButton />
          </div>
          <AdminNav />
          <Link
            href="/"
            className="mt-3 block rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-arena-800 hover:text-zinc-300"
          >
            ← View site
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
