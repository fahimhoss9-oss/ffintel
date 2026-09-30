import type { Metadata } from "next";
import { getWeapons } from "@/lib/data";
import { SectionTitle } from "@/components/ui";
import { CalculatorClient } from "./calculator-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TTK & DPS Calculator",
  description:
    "Free Fire TTK (time to kill) and DPS calculator — prefill a weapon's verified stats or enter your own. Independent fan project.",
};

export default async function CalculatorsPage(props: PageProps<"/calculators">) {
  const searchParams = await props.searchParams;
  const initialWeapon =
    typeof searchParams.weapon === "string" ? searchParams.weapon : "";

  const weapons = await getWeapons();

  return (
    <div>
      <SectionTitle
        title="TTK & DPS calculator"
        subtitle="Prefill a weapon's verified stats or enter values manually. All results are calculated estimates, not official statistics."
      />
      <CalculatorClient weapons={weapons} initialWeapon={initialWeapon} />
    </div>
  );
}
