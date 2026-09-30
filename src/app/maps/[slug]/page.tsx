import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMap } from "@/lib/data";
import { EmptyState, SectionTitle, StatusBadge } from "@/components/ui";
import { InteractiveMapLoader } from "./InteractiveMapLoader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const map = await getMap(slug);
  if (!map) return { title: "Map not found" };
  return {
    title: `${map.name} — Interactive Map`,
    description:
      map.description ??
      `Interactive schematic map of ${map.name} with searchable locations and loot layers. Independent fan project.`,
  };
}

export default async function MapDetailPage({ params }: Props) {
  const { slug } = await params;
  const map = await getMap(slug);
  if (!map) notFound();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              {map.name}
            </h1>
            <StatusBadge status={map.verifiedStatus} isDemo={map.isDemo} />
          </div>
          {map.description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {map.description}
            </p>
          )}
        </div>
      </div>

      {map.locations.length === 0 ? (
        <EmptyState
          title="No locations recorded yet"
          hint="Locations and loot layers will appear here once they are added and verified."
        />
      ) : (
        <>
          <InteractiveMapLoader map={map} />
          <p className="mt-3 text-xs leading-relaxed text-zinc-600">
            Schematic illustration — not official map art. Independent
            fan/community project, not affiliated with Garena. Location data
            is illustrative unless marked verified.
          </p>
        </>
      )}

      <div className="mt-8">
        <SectionTitle title="About this map" />
        <dl className="max-w-xl rounded-xl bg-arena-900 px-5 py-2 ring-1 ring-arena-700/60">
          <div className="flex items-center justify-between gap-4 border-b border-arena-700/50 py-2.5">
            <dt className="text-sm text-zinc-400">Theme</dt>
            <dd className="text-sm font-semibold text-zinc-100">
              {map.theme ?? "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-arena-700/50 py-2.5">
            <dt className="text-sm text-zinc-400">Locations</dt>
            <dd className="text-sm font-semibold text-zinc-100">
              {map.locations.length}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-sm text-zinc-400">Map artwork</dt>
            <dd className="text-sm font-semibold text-zinc-100">
              {map.imageCredit ?? "Original schematic"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
