import Link from "next/link";
import { db } from "@/lib/db";
import { Card, SectionTitle, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="p-5 transition-colors hover:ring-accent-500/40">
        <p className="text-3xl font-black tracking-tight text-zinc-50">{value}</p>
        <p className="mt-1 text-sm text-zinc-400">{label}</p>
      </Card>
    </Link>
  );
}

export default async function AdminDashboard() {
  const prisma = db();
  const [
    weaponCount,
    mapCount,
    tournamentCount,
    teamCount,
    unverifiedWeapons,
    unverifiedMaps,
    unverifiedTournaments,
    unverifiedTeams,
    recentLogs,
  ] = await Promise.all([
    prisma.weapon.count(),
    prisma.map.count(),
    prisma.tournament.count(),
    prisma.team.count(),
    prisma.weapon.count({ where: { verifiedStatus: "UNVERIFIED" } }),
    prisma.map.count({ where: { verifiedStatus: "UNVERIFIED" } }),
    prisma.tournament.count({ where: { verifiedStatus: "UNVERIFIED" } }),
    prisma.team.count({ where: { verifiedStatus: "UNVERIFIED" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const unverifiedTotal = unverifiedWeapons + unverifiedMaps + unverifiedTournaments + unverifiedTeams;

  return (
    <div>
      <SectionTitle title="Dashboard" subtitle="Content overview and recent admin activity." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Weapons" value={weaponCount} href="/admin/weapons" />
        <StatCard label="Maps" value={mapCount} href="/admin/maps" />
        <StatCard label="Tournaments" value={tournamentCount} href="/admin/tournaments" />
        <StatCard label="Teams" value={teamCount} href="/admin/teams" />
      </div>

      <Link href="/admin/verify">
        <Card
          className={`mt-4 p-5 transition-colors hover:ring-accent-500/40 ${
            unverifiedTotal > 0 ? "ring-amber-500/30" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black tracking-tight text-amber-300">{unverifiedTotal}</p>
              <p className="mt-1 text-sm text-zinc-400">items waiting for verification</p>
            </div>
            <span className="rounded-lg bg-arena-800 px-3 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-arena-700">
              Open verify queue →
            </span>
          </div>
        </Card>
      </Link>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-500">
          Recent activity
        </h3>
        {recentLogs.length === 0 ? (
          <EmptyState title="No admin activity yet" hint="Actions you take will appear here." />
        ) : (
          <Card className="divide-y divide-arena-700/50">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200">
                    <span className="font-semibold capitalize text-accent-400">{log.action}</span>{" "}
                    <span className="text-zinc-500">{log.entityType}</span>
                  </p>
                  {log.details && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{log.details}</p>
                  )}
                  {log.user?.email && (
                    <p className="mt-0.5 text-xs text-zinc-600">{log.user.email}</p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
