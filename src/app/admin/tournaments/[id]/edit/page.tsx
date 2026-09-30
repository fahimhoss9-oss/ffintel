import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, SectionTitle } from "@/components/ui";
import { TournamentForm } from "../../TournamentForm";

export const dynamic = "force-dynamic";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tournament, sources] = await Promise.all([
    db().tournament.findUnique({ where: { id } }),
    db().source.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!tournament) notFound();

  return (
    <div>
      <SectionTitle title={`Edit: ${tournament.name}`} subtitle="Update the tournament record." />
      <Card className="p-5 sm:p-6">
        <TournamentForm tournament={tournament} sources={sources} />
      </Card>
    </div>
  );
}
