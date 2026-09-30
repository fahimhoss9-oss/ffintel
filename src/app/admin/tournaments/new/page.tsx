import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { TournamentForm } from "../TournamentForm";

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  const sources = await db().source.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <SectionTitle title="New tournament" subtitle="Add a tournament to the esports hub." />
      <Card className="p-5 sm:p-6">
        <TournamentForm sources={sources} />
      </Card>
    </div>
  );
}
