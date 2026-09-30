import Link from "next/link";
import { db } from "@/lib/db";
import { Card, SectionTitle, StatusBadge, EmptyState } from "@/components/ui";
import { DeleteButton } from "../shared";
import { deleteTeam } from "../actions";

export const dynamic = "force-dynamic";

export default async function TeamsAdminPage() {
  const teams = await db().team.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <SectionTitle title="Teams" subtitle={`${teams.length} team records`} />
        <Link
          href="/admin/teams/new"
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 hover:bg-accent-400"
        >
          + New team
        </Link>
      </div>

      {teams.length === 0 ? (
        <EmptyState title="No teams yet" hint="Add esports organizations and rosters." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-arena-700/60">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Region
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-b border-arena-700/40 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-100">{t.name}</p>
                    <p className="font-mono text-xs text-zinc-500">{t.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {[t.region, t.country].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/teams/${t.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-arena-700 hover:bg-arena-800"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={t.id} onDelete={deleteTeam} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
