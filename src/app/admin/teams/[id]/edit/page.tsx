import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { TeamForm } from "../../TeamForm";

export const dynamic = "force-dynamic";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [team, sources] = await Promise.all([
    db().team.findUnique({ where: { id } }),
    db().source.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!team) notFound();

  return (
    <div>
      <SectionTitle title={`Edit: ${team.name}`} subtitle="Update the team record." />
      <Card className="p-5 sm:p-6">
        <TeamForm team={team} sources={sources} />
      </Card>
    </div>
  );
}
