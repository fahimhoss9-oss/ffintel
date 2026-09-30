import Link from "next/link";
import type { Metadata } from "next";
import { getMaps } from "@/lib/data";
import { Card, EmptyState, SectionTitle, StatusBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interactive Maps",
  description:
    "Interactive Free Fire maps with searchable locations, loot areas and tactical layers. Independent fan project.",
};

export default async function MapsPage() {
  const maps = await getMaps();

  return (
    <div>
      <SectionTitle
        title="Interactive Maps"
        subtitle="Explore locations, loot areas and tactical layers. All maps are original schematics — not official map art."
      />

      {maps.length === 0 ? (
        <EmptyState
          title="No maps yet"
          hint="Maps will appear here once they are added to the database."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <Link
              key={map.id}
              href={`/maps/${map.slug}`}
              className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Card className="flex h-full flex-col p-5 transition hover:ring-accent-500/40">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-zinc-50">{map.name}</h3>
                  <StatusBadge
                    status={map.verifiedStatus}
                    isDemo={map.isDemo}
                  />
                </div>
                {map.theme && (
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-accent-400">
                    {map.theme}
                  </p>
                )}
                {map.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                    {map.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-arena-700/50 pt-3 text-sm">
                  <span className="text-zinc-400">
                    <span className="font-bold text-zinc-100">
                      {map.locations.length}
                    </span>{" "}
                    {map.locations.length === 1 ? "location" : "locations"}
                  </span>
                  <span className="font-semibold text-accent-400">
                    Open map →
                  </span>
                </div>
                {map.imageCredit && (
                  <p className="mt-2 text-[11px] italic text-zinc-600">
                    {map.imageCredit}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
