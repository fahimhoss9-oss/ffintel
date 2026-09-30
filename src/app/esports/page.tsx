import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, SectionTitle, StatusBadge } from "@/components/ui";
import { getTeams, getTournaments, isDemoMode } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Esports Hub",
  description:
    "Free Fire esports — upcoming and completed tournaments, teams, players, standings and official livestreams.",
};

export function TournamentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UPCOMING: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
    ONGOING: "bg-red-500/15 text-red-300 ring-red-500/30",
    COMPLETED: "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30",
    CANCELLED: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? styles.UPCOMING
      }`}
    >
      {label}
    </span>
  );
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function EsportsHub({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const [tournaments, teams] = await Promise.all([getTournaments(), getTeams()]);
  const demo = isDemoMode();

  const regions = Array.from(
    new Set(tournaments.map((t) => t.region).filter((r): r is string => !!r))
  ).sort();

  const filtered = region ? tournaments.filter((t) => t.region === region) : tournaments;
  const ongoing = filtered.filter((t) => t.status === "ONGOING");
  const upcoming = filtered.filter((t) => t.status === "UPCOMING");
  const completed = filtered.filter((t) => t.status === "COMPLETED");

  const groups: { title: string; items: typeof filtered }[] = [
    { title: "Ongoing", items: ongoing },
    { title: "Upcoming", items: upcoming },
    { title: "Completed", items: completed },
  ];

  function tournamentCard(t: (typeof filtered)[number]) {
    return (
      <Link key={t.id} href={`/esports/tournaments/${t.slug}`}>
        <Card className="h-full p-5 transition-colors hover:bg-arena-850">
          <div className="flex flex-wrap items-center gap-2">
            <TournamentStatusBadge status={t.status} />
            <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo || demo} />
          </div>
          <p className="mt-3 font-bold text-zinc-50">{t.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {[t.region, fmtDate(t.startDate)].filter(Boolean).join(" · ") || "Date TBA"}
          </p>
          {t.prizePool && <p className="mt-1 text-sm font-semibold text-accent-400">{t.prizePool}</p>}
        </Card>
      </Link>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">
          Esports <span className="text-accent-400">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Tournaments, teams and players — schedules, standings and official streams.
        </p>
      </div>

      {/* Region filter */}
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/esports"
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors ${
              !region
                ? "bg-accent-500/15 text-accent-400 ring-accent-500/40"
                : "bg-arena-900 text-zinc-400 ring-arena-700/60 hover:text-zinc-200"
            }`}
          >
            All regions
          </Link>
          {regions.map((r) => (
            <Link
              key={r}
              href={`/esports?region=${encodeURIComponent(r)}`}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors ${
                region === r
                  ? "bg-accent-500/15 text-accent-400 ring-accent-500/40"
                  : "bg-arena-900 text-zinc-400 ring-arena-700/60 hover:text-zinc-200"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      )}

      {/* Tournament groups */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No tournaments found"
          hint={
            region
              ? `No tournaments listed for region "${region}".`
              : "Tournament schedules will appear here once added via the admin dashboard."
          }
        />
      ) : (
        groups.map(
          (g) =>
            g.items.length > 0 && (
              <section key={g.title}>
                <SectionTitle title={g.title} subtitle={`${g.items.length} tournament${g.items.length === 1 ? "" : "s"}`} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map(tournamentCard)}
                </div>
              </section>
            )
        )
      )}

      {/* Teams */}
      <section>
        <div className="flex items-end justify-between">
          <SectionTitle title="Teams" subtitle="Esports organizations" />
          <Link
            href="/esports/teams"
            className="mb-5 shrink-0 text-sm font-semibold text-accent-400 hover:text-accent-500"
          >
            View all →
          </Link>
        </div>
        {teams.length === 0 ? (
          <EmptyState
            title="No teams listed yet"
            hint="Team profiles will appear here once added via the admin dashboard."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {teams.slice(0, 8).map((t) => (
              <Link key={t.id} href={`/esports/teams/${t.slug}`}>
                <Card className="h-full p-5 transition-colors hover:bg-arena-850">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-zinc-50">{t.name}</p>
                    <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo || demo} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[t.region, t.country].filter(Boolean).join(" · ")}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
