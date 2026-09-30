import { db } from "@/lib/db";
import { Card, SectionTitle, EmptyState } from "@/components/ui";
import { VerifyButton } from "../shared";

export const dynamic = "force-dynamic";

type QueueItem = {
  id: string;
  name: string;
  subtitle: string;
  updatedAt: Date;
};

function QueueSection({
  title,
  entityType,
  items,
}: {
  title: string;
  entityType: "weapon" | "tournament" | "team" | "map";
  items: QueueItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-500">
        {title} · {items.length}
      </h3>
      <Card className="divide-y divide-arena-700/50">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">{item.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {item.subtitle} · updated {new Date(item.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <VerifyButton entityType={entityType} id={item.id} />
          </div>
        ))}
      </Card>
    </div>
  );
}

export default async function VerifyQueuePage() {
  const prisma = db();
  const [weapons, tournaments, teams, maps] = await Promise.all([
    prisma.weapon.findMany({
      where: { verifiedStatus: "UNVERIFIED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.tournament.findMany({
      where: { verifiedStatus: "UNVERIFIED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.team.findMany({
      where: { verifiedStatus: "UNVERIFIED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
    prisma.map.findMany({
      where: { verifiedStatus: "UNVERIFIED" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ]);

  const total = weapons.length + tournaments.length + teams.length + maps.length;

  return (
    <div>
      <SectionTitle
        title="Verify queue"
        subtitle="Review unverified items and mark them verified with one click."
      />
      {total === 0 ? (
        <EmptyState
          title="All clear ✓"
          hint="Every item is verified. New or imported items will appear here."
        />
      ) : (
        <>
          <QueueSection
            title="Weapons"
            entityType="weapon"
            items={weapons.map((w) => ({
              id: w.id,
              name: w.name,
              subtitle: w.category,
              updatedAt: w.updatedAt,
            }))}
          />
          <QueueSection
            title="Tournaments"
            entityType="tournament"
            items={tournaments.map((t) => ({
              id: t.id,
              name: t.name,
              subtitle: [t.region, t.status].filter(Boolean).join(" · "),
              updatedAt: t.updatedAt,
            }))}
          />
          <QueueSection
            title="Teams"
            entityType="team"
            items={teams.map((t) => ({
              id: t.id,
              name: t.name,
              subtitle: [t.region, t.country].filter(Boolean).join(" · "),
              updatedAt: t.updatedAt,
            }))}
          />
          <QueueSection
            title="Maps"
            entityType="map"
            items={maps.map((m) => ({
              id: m.id,
              name: m.name,
              subtitle: m.theme ?? "—",
              updatedAt: m.updatedAt,
            }))}
          />
          <p className="mt-4 text-xs text-zinc-500">
            Showing up to 30 items per section. Verifying sets the status to VERIFIED, stamps
            today's date, and writes an audit-log entry.
          </p>
        </>
      )}
    </div>
  );
}
