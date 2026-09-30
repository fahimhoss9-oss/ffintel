import Link from "next/link";
import { db } from "@/lib/db";
import { Card, SectionTitle, StatusBadge, EmptyState } from "@/components/ui";
import { DeleteButton } from "../shared";
import { deleteMap } from "../actions";

export const dynamic = "force-dynamic";

export default async function MapsAdminPage() {
  const maps = await db().map.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { locations: true } } },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <SectionTitle title="Maps" subtitle={`${maps.length} map records`} />
        <Link
          href="/admin/maps/new"
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 hover:bg-accent-400"
        >
          + New map
        </Link>
      </div>

      {maps.length === 0 ? (
        <EmptyState title="No maps yet" hint="Add game maps for the interactive map system." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-arena-700/60">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Locations
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
              {maps.map((m) => (
                <tr key={m.id} className="border-b border-arena-700/40 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-100">{m.name}</p>
                    <p className="font-mono text-xs text-zinc-500">{m.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{m._count.locations}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.verifiedStatus} isDemo={m.isDemo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/maps/${m.id}/edit`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-arena-700 hover:bg-arena-800"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={m.id} onDelete={deleteMap} />
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
