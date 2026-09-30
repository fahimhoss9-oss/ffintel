import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { WeaponForm } from "../../WeaponForm";

export const dynamic = "force-dynamic";

export default async function EditWeaponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [weapon, sources] = await Promise.all([
    db().weapon.findUnique({ where: { id } }),
    db().source.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!weapon) notFound();

  return (
    <div>
      <SectionTitle title={`Edit: ${weapon.name}`} subtitle="Update the weapon record." />
      <Card className="p-5 sm:p-6">
        <WeaponForm weapon={weapon} sources={sources} />
      </Card>
    </div>
  );
}
