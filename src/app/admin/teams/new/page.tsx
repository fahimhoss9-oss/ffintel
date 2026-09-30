import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  const sources = await db().source.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <SectionTitle title="New team" subtitle="Add a team profile." />
      <Card className="p-5 sm:p-6">
        <TeamForm sources={sources} />
      </Card>
    </div>
  );
}
