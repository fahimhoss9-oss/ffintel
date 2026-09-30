import Link from "next/link";
import { db } from "@/lib/db";
import { Card, SectionTitle, StatusBadge, EmptyState } from "@/components/ui";
import { DeleteButton } from "../shared";
import { deleteTournament } from "../actions";

export const dynamic = "force-dynamic";

export default async function TournamentsAdminPage() {
  const tournaments = await db().tournament.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <SectionTitle title="Tournaments" subtitle={`${tournaments.length} tournament records`} />
        <Link
          href="/admin/tournaments/new"
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 hover:bg-accent-400"
        >
          + New tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <EmptyState title="No tournaments yet" hint="Add upcoming, ongoing or completed events." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-arena-700/60">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Verification
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((t) => (
                <tr key={t.id} className="border-b border-arena-700/40 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-100">{t.name}</p>
                    <p className="text-xs text-zinc-500">
                      {[t.region, t.startDate ? new Date(t.startDate).toLocaleDateString() : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-zinc-300">{t.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.verifiedStatus} isDemo={t.isDemo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/tournaments/${t.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-arena-700 hover:bg-arena-800"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={t.id} onDelete={deleteTournament} />
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
