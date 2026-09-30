import type { Metadata } from "next";
import { getWeapons } from "@/lib/data";
import { SectionTitle } from "@/components/ui";
import { CompareClient } from "./compare-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Weapons",
  description:
    "Side-by-side Free Fire weapon comparison — damage, fire rate, magazine, reload, range, DPS and TTK. Independent fan project.",
};

export default async function ComparePage(props: PageProps<"/compare">) {
  const searchParams = await props.searchParams;
  const raw = typeof searchParams.weapons === "string" ? searchParams.weapons : "";
  const initialSlugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const weapons = await getWeapons();

  return (
    <div>
      <SectionTitle
        title="Compare weapons"
        subtitle="Select 2–4 weapons for a side-by-side comparison. Derived values are labeled as calculated."
      />
      <CompareClient weapons={weapons} initialSlugs={initialSlugs} />
    </div>
  );
}
