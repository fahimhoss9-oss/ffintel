import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { MapForm } from "../MapForm";

export const dynamic = "force-dynamic";

export default async function NewMapPage() {
  const sources = await db().source.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <SectionTitle title="New map" subtitle="Add a game map." />
      <Card className="p-5 sm:p-6">
        <MapForm sources={sources} />
      </Card>
    </div>
  );
}
