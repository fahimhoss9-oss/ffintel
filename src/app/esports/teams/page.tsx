import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, StatusBadge } from "@/components/ui";
import { getTeams, isDemoMode } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teams",
  description: "Free Fire esports teams — rosters, regions and tournament history.",
};

type TeamWithPlayers = {
  players?: { id: string }[];
};

export default async function TeamsPage() {
  const teams = await getTeams();
  const demo = isDemoMode();

  return (
    <div className="space-y-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/esports" className="hover:text-accent-400">
          Esports
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-300">Teams</span>
      </nav>

      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">
          Teams
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Esports organizations competing in Free Fire tournaments.
        </p>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          title="No teams listed yet"
          hint="Team profiles will appear here once added via the admin dashboard."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const roster = (t as typeof t & TeamWithPlayers).players ?? [];
            return (
              <Link key={t.id} href={`/esports/teams/${t.slug}`}>
                <Card className="h-full p-5 transition-colors hover:bg-arena-850">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-zinc-50">{t.name}</p>
                    <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo || demo} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[t.region, t.country].filter(Boolean).join(" · ") || "Region TBA"}
                  </p>
                  {t.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{t.description}</p>
                  )}
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {roster.length} player{roster.length === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
