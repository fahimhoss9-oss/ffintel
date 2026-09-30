import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { MapForm } from "../../MapForm";

export const dynamic = "force-dynamic";

export default async function EditMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [map, sources] = await Promise.all([
    db().map.findUnique({ where: { id } }),
    db().source.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!map) notFound();

  return (
    <div>
      <SectionTitle title={`Edit: ${map.name}`} subtitle="Update the map record." />
      <Card className="p-5 sm:p-6">
        <MapForm map={map} sources={sources} />
      </Card>
    </div>
  );
}
