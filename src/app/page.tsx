import Link from "next/link";
import type { Metadata } from "next";
import { Card, EmptyState, SectionTitle, StatusBadge } from "@/components/ui";
import {
  getCurrentVersion,
  getGame,
  getMaps,
  getTeams,
  getTournaments,
  getWeapons,
  isDemoMode,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Fire Game Intelligence & Esports",
  description:
    "FFIntel — Free Fire weapons database, interactive maps, TTK/DPS calculators, tournaments, teams and players. Independent fan project, not affiliated with Garena.",
};

const QUICK_NAV = [
  {
    href: "/weapons",
    title: "Weapons",
    desc: "Stats, attachments & comparisons",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="2.5" />
        <path strokeLinecap="round" d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
      </svg>
    ),
  },
  {
    href: "/maps",
    title: "Maps",
    desc: "Interactive maps, loot & drops",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.5-2.5v-13L9 7l6-2.5L20.5 7v13L15 17.5 9 20z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7v13M15 4.5v13" />
      </svg>
    ),
  },
  {
    href: "/esports",
    title: "Esports",
    desc: "Tournaments, teams & players",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 6H4a2 2 0 002 4h1M17 6h3a2 2 0 01-2 4h-1" />
      </svg>
    ),
  },
  {
    href: "/calculators",
    title: "Calculators",
    desc: "TTK & DPS calculators",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path strokeLinecap="round" d="M8.5 7.5h7" />
        <path strokeLinecap="round" d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" />
      </svg>
    ),
  },
];

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Home() {
  const [game, version, weapons, maps, tournaments, teams] = await Promise.all([
    getGame(),
    getCurrentVersion(),
    getWeapons(),
    getMaps(),
    getTournaments(),
    getTeams(),
  ]);
  const demo = isDemoMode();

  const featuredWeapons = weapons.slice(0, 4);
  const popularMaps = maps.slice(0, 4);
  const upcomingTournaments = tournaments.filter((t) => t.status === "UPCOMING").slice(0, 3);
  const latestTeams = teams.slice(0, 4);

  const stats = [
    { label: "Weapons", value: weapons.length },
    { label: "Maps", value: maps.length },
    { label: "Tournaments", value: tournaments.length },
    { label: "Teams", value: teams.length },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-arena-900 px-6 py-10 ring-1 ring-arena-700/60 sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            {version && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-400 ring-1 ring-inset ring-accent-500/40">
                Patch {version.version}
              </span>
            )}
            {demo && <StatusBadge isDemo />}
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">
            {game.name} <span className="text-accent-400">Intelligence</span> &amp; Esports
          </h1>
          {version?.title && (
            <p className="mt-2 text-sm font-medium text-zinc-300">
              {version.title}
              {version.releaseDate && (
                <span className="text-zinc-500"> · released {fmtDate(version.releaseDate)}</span>
              )}
            </p>
          )}
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {game.description ??
              "Weapons, maps, calculators and esports coverage for Free Fire — every stat labeled with its source and patch."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/weapons"
              className="rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-bold text-arena-950 transition-colors hover:bg-accent-400"
            >
              Browse weapons
            </Link>
            <Link
              href="/esports"
              className="rounded-lg bg-arena-800 px-5 py-2.5 text-sm font-bold text-zinc-100 ring-1 ring-arena-700 transition-colors hover:bg-arena-700"
            >
              Explore esports
            </Link>
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <section>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="group h-full p-5 transition-colors hover:bg-arena-850">
                <div className="text-accent-400">{item.icon}</div>
                <p className="mt-3 font-bold text-zinc-50 group-hover:text-accent-400">{item.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-5 py-4 text-center">
            <p className="text-2xl font-black text-zinc-50">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{s.label}</p>
          </Card>
        ))}
      </section>

      {/* Featured weapons */}
      <section>
        <div className="flex items-end justify-between">
          <SectionTitle title="Featured weapons" subtitle="Top entries from the weapon database" />
          <Link href="/weapons" className="mb-5 shrink-0 text-sm font-semibold text-accent-400 hover:text-accent-500">
            View all →
          </Link>
        </div>
        {featuredWeapons.length === 0 ? (
          <EmptyState title="No weapons yet" hint="Weapon data will appear here once added." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredWeapons.map((w) => {
              const stat = w.stats[0];
              return (
                <Link key={w.id} href={`/weapons/${w.slug}`}>
                  <Card className="h-full p-5 transition-colors hover:bg-arena-850">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-zinc-50">{w.name}</p>
                      <StatusBadge status={w.verifiedStatus} isDemo={w.isDemo || demo} />
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {w.category}
                    </p>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Damage</dt>
                        <dd className="font-semibold text-zinc-200">{stat?.damage ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Magazine</dt>
                        <dd className="font-semibold text-zinc-200">{stat?.magazine ?? "—"}</dd>
                      </div>
                    </dl>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular maps */}
      <section>
        <div className="flex items-end justify-between">
          <SectionTitle title="Popular maps" subtitle="Battle royale battlegrounds" />
          <Link href="/maps" className="mb-5 shrink-0 text-sm font-semibold text-accent-400 hover:text-accent-500">
            View all →
          </Link>
        </div>
        {popularMaps.length === 0 ? (
          <EmptyState title="No maps yet" hint="Map data will appear here once added." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularMaps.map((m) => (
              <Link key={m.id} href={`/maps/${m.slug}`}>
                <Card className="h-full p-5 transition-colors hover:bg-arena-850">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-zinc-50">{m.name}</p>
                    <StatusBadge status={m.verifiedStatus} isDemo={m.isDemo || demo} />
                  </div>
                  {m.theme && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{m.theme}</p>
                  )}
                  <p className="mt-3 text-sm text-zinc-400">
                    {m.locations.length} location{m.locations.length === 1 ? "" : "s"} mapped
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming tournaments */}
      <section>
        <div className="flex items-end justify-between">
          <SectionTitle title="Upcoming tournaments" subtitle="What's next in Free Fire esports" />
          <Link href="/esports" className="mb-5 shrink-0 text-sm font-semibold text-accent-400 hover:text-accent-500">
            Esports hub →
          </Link>
        </div>
        {upcomingTournaments.length === 0 ? (
          <EmptyState
            title="No upcoming tournaments listed"
            hint="Tournament schedules will appear here once added via the admin dashboard."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTournaments.map((t) => (
              <Link key={t.id} href={`/esports/tournaments/${t.slug}`}>
                <Card className="h-full p-5 transition-colors hover:bg-arena-850">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-zinc-50">{t.name}</p>
                    <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo || demo} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    {[t.region, fmtDate(t.startDate)].filter(Boolean).join(" · ")}
                  </p>
                  {t.prizePool && (
                    <p className="mt-1 text-sm font-semibold text-accent-400">{t.prizePool}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest teams */}
      <section>
        <div className="flex items-end justify-between">
          <SectionTitle title="Teams" subtitle="Esports organizations to follow" />
          <Link
            href="/esports/teams"
            className="mb-5 shrink-0 text-sm font-semibold text-accent-400 hover:text-accent-500"
          >
            View all →
          </Link>
        </div>
        {latestTeams.length === 0 ? (
          <EmptyState
            title="No teams listed yet"
            hint="Team profiles will appear here once added via the admin dashboard."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latestTeams.map((t) => (
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
