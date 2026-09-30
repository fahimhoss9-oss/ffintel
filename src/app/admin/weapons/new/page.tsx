import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { WeaponForm } from "../WeaponForm";

export const dynamic = "force-dynamic";

export default async function NewWeaponPage() {
  const sources = await db().source.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <SectionTitle title="New weapon" subtitle="Add a weapon to the database." />
      <Card className="p-5 sm:p-6">
        <WeaponForm sources={sources} />
      </Card>
    </div>
  );
}
