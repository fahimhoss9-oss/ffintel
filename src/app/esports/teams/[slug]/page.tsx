import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, EmptyState, SectionTitle, StatRow, StatusBadge } from "@/components/ui";
import { getSources, getTeam, isDemoMode } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

type PlayerEntry = {
  ign: string;
  realName: string | null;
  role: string | null;
  country: string | null;
  verifiedStatus: string;
  isDemo: boolean;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTeam(slug);
  if (!t) return { title: "Team not found" };
  return {
    title: t.name,
    description: t.description ?? `${t.name} — Free Fire esports team profile, roster and details.`,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) notFound();
  const demo = isDemoMode();

  const roster = ((team as typeof team & { players?: PlayerEntry[] }).players ?? []).sort(
    (a, b) => a.ign.localeCompare(b.ign)
  );
  const source = team.sourceId ? getSources().find((s) => s.id === team.sourceId) : undefined;

  return (
    <div className="space-y-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/esports" className="hover:text-accent-400">
          Esports
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/esports/teams" className="hover:text-accent-400">
          Teams
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-300">{team.name}</span>
      </nav>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={team.verifiedStatus} isDemo={team.isDemo || demo} />
          {team.region && (
            <span className="inline-flex items-center rounded-full bg-arena-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-arena-700">
              {team.region}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">
          {team.name}
        </h1>
        {team.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{team.description}</p>
        )}
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Team info" />
        <dl>
          <StatRow label="Region" value={team.region} />
          <StatRow label="Country" value={team.country} />
          <StatRow
            label="Website"
            value={
              team.websiteUrl ? (
                <a
                  href={team.websiteUrl}
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

      <section>
        <SectionTitle title="Roster" subtitle={`${roster.length} player${roster.length === 1 ? "" : "s"}`} />
        {roster.length === 0 ? (
          <EmptyState
            title="No roster listed yet"
            hint="Player profiles will appear here once added via the admin dashboard."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-arena-700/60 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-3 font-semibold">In-game name</th>
                    <th className="px-5 py-3 font-semibold">Real name</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Country</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p, i) => (
                    <tr key={i} className="border-b border-arena-700/40 last:border-0">
                      <td className="px-5 py-3">
                        <span className="font-bold text-zinc-50">{p.ign}</span>{" "}
                        <StatusBadge status={p.verifiedStatus} isDemo={p.isDemo || demo} />
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{p.realName ?? "—"}</td>
                      <td className="px-5 py-3 text-zinc-300">{p.role ?? "—"}</td>
                      <td className="px-5 py-3 text-zinc-300">{p.country ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
