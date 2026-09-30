"use client";

import nextDynamic from "next/dynamic";
import type { MapWithLocations } from "@/data/demo";

// next/dynamic with `ssr: false` is only allowed inside a Client Component
// (Next.js 16 restriction). This wrapper keeps the server page clean.
const InteractiveMap = nextDynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[62vh] min-h-[420px] items-center justify-center rounded-xl bg-arena-900 text-sm text-zinc-500 ring-1 ring-arena-700/60">
      Loading interactive map…
    </div>
  ),
});

export function InteractiveMapLoader({ map }: { map: MapWithLocations }) {
  return <InteractiveMap map={map} />;
}
