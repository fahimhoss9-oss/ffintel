import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, EmptyState, SectionTitle, StatRow, StatusBadge } from "@/components/ui";
import { TournamentStatusBadge } from "@/app/esports/page";
import { getSources, getTournament, isDemoMode } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

type TeamEntry = {
  placement: number | null;
  points: number | null;
  prize: string | null;
  team: { name: string; slug: string; region: string | null };
};
type MatchEntry = {
  id: string;
  name: string | null;
  scheduledAt: Date | null;
  status: string;
  streamUrl: string | null;
  results: {
    placement: number | null;
    kills: number | null;
    points: number | null;
    team: { name: string; slug: string };
  }[];
};
type StreamEntry = {
  id: string;
  title: string;
  platform: string;
  embedUrl: string;
  status: string;
};
type TournamentDetail = {
  teams?: TeamEntry[];
  matches?: MatchEntry[];
  livestreams?: StreamEntry[];
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTournament(slug);
  if (!t) return { title: "Tournament not found" };
  return {
    title: t.name,
    description:
      t.description ??
      `${t.name} — Free Fire tournament details, participating teams, matches, standings and official livestream.`,
  };
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

export default async function TournamentDetailPage({ params }: Props) {
  const { slug } = await params;
  const tournament = await getTournament(slug);
  if (!tournament) notFound();
  const demo = isDemoMode();
  const detail = tournament as typeof tournament & TournamentDetail;

  const teams = [...(detail.teams ?? [])].sort(
    (a, b) => (a.placement ?? 9999) - (b.placement ?? 9999)
  );
  const matches = detail.matches ?? [];
  const streams = detail.livestreams ?? [];
  const source = tournament.sourceId
    ? getSources().find((s) => s.id === tournament.sourceId)
    : undefined;

  const streamEmbeds = [
    ...streams
      .filter((s) => s.embedUrl)
      .map((s) => ({ title: s.title, url: s.embedUrl, status: s.status })),
    ...(tournament.streamUrl ? [{ title: "Official stream", url: tournament.streamUrl, status: "" }] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500">
        <Link href="/esports" className="hover:text-accent-400">
          Esports
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-300">Tournaments</span>
      </nav>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <TournamentStatusBadge status={tournament.status} />
          <StatusBadge status={tournament.verifiedStatus} isDemo={tournament.isDemo || demo} />
          {tournament.region && (
            <span className="inline-flex items-center rounded-full bg-arena-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-arena-700">
              {tournament.region}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">
          {tournament.name}
        </h1>
        {tournament.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {tournament.description}
          </p>
        )}
      </div>

      {/* Info table */}
      <Card className="p-5 sm:p-6">
        <SectionTitle title="Tournament info" />
        <dl>
          <StatRow label="Status" value={tournament.status.charAt(0) + tournament.status.slice(1).toLowerCase()} />
          <StatRow label="Start date" value={fmtDate(tournament.startDate)} />
          <StatRow label="End date" value={fmtDate(tournament.endDate)} />
          <StatRow label="Region" value={tournament.region} />
          <StatRow label="Organizer" value={tournament.organizer} />
          <StatRow label="Format" value={tournament.format} />
          <StatRow label="Prize pool" value={tournament.prizePool} />
          <StatRow
            label="Official site"
            value={
              tournament.officialUrl ? (
                <a
                  href={tournament.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-400 hover:text-accent-500"
                >
                  Visit official site ↗
                </a>
              ) : undefined
            }
          />
          <StatRow
            label="Source"
            value={
              source ? (
                source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-400 hover:text-accent-500"
                  >
                    {source.name} ↗
                  </a>
                ) : (
                  source.name
                )
              ) : undefined
            }
          />
        </dl>
      </Card>

      {/* Livestreams */}
      <section>
        <SectionTitle title="Livestream" subtitle="Official broadcasts only" />
        {streamEmbeds.length === 0 ? (
          <EmptyState
            title="No official stream linked yet"
            hint="An official YouTube stream will be embedded here when one is added."
          />
        ) : (
          <div className="space-y-4">
            {streamEmbeds.map((s, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="border-b border-arena-700/50 px-5 py-3">
                  <p className="text-sm font-semibold text-zinc-200">{s.title}</p>
                </div>
                {isYouTubeUrl(s.url) ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={s.url}
                      title={s.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-accent-400 hover:text-accent-500"
                    >
                      Open official stream ↗
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Standings / teams */}
      <section>
        <SectionTitle title="Teams & standings" subtitle={`${teams.length} participating team${teams.length === 1 ? "" : "s"}`} />
        {teams.length === 0 ? (
          <EmptyState
            title="No teams listed yet"
            hint="Participating teams and standings will appear here once added."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-arena-700/60 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-3 font-semibold">#</th>
                    <th className="px-5 py-3 font-semibold">Team</th>
                    <th className="px-5 py-3 font-semibold">Points</th>
                    <th className="px-5 py-3 font-semibold">Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((entry, i) => (
                    <tr key={i} className="border-b border-arena-700/40 last:border-0">
                      <td className="px-5 py-3 font-bold text-zinc-300">{entry.placement ?? "—"}</td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/esports/teams/${entry.team.slug}`}
                          className="font-semibold text-zinc-100 hover:text-accent-400"
                        >
                          {entry.team.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{entry.points ?? "—"}</td>
                      <td className="px-5 py-3 text-zinc-300">{entry.prize ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Matches */}
      <section>
        <SectionTitle title="Matches" subtitle={`${matches.length} match${matches.length === 1 ? "" : "es"}`} />
        {matches.length === 0 ? (
          <EmptyState
            title="No matches recorded yet"
            hint="Match schedules and results will appear here once added."
          />
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const results = [...m.results].sort(
                (a, b) => (a.placement ?? 9999) - (b.placement ?? 9999)
              );
              return (
                <Card key={m.id} className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-zinc-50">{m.name ?? "Match"}</p>
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{fmtDateTime(m.scheduledAt)}</p>
                  {results.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">Results not yet available.</p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-arena-700/60 text-xs uppercase tracking-wide text-zinc-500">
                            <th className="py-2 pr-4 font-semibold">#</th>
                            <th className="py-2 pr-4 font-semibold">Team</th>
                            <th className="py-2 pr-4 font-semibold">Kills</th>
                            <th className="py-2 font-semibold">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => (
                            <tr key={i} className="border-b border-arena-700/40 last:border-0">
                              <td className="py-2 pr-4 font-bold text-zinc-300">{r.placement ?? "—"}</td>
                              <td className="py-2 pr-4">
                                <Link
                                  href={`/esports/teams/${r.team.slug}`}
                                  className="font-semibold text-zinc-100 hover:text-accent-400"
                                >
                                  {r.team.name}
                                </Link>
                              </td>
                              <td className="py-2 pr-4 text-zinc-300">{r.kills ?? "—"}</td>
                              <td className="py-2 text-zinc-300">{r.points ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
