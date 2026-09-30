"use client";

import { useActionState } from "react";
import type { Source, Team } from "@prisma/client";
import { saveTeam, type ActionResult } from "../actions";
import {
  Field,
  TextInput,
  TextArea,
  SubmitButton,
  CancelLink,
  FormError,
  SourceSelect,
  VerificationSelect,
} from "../shared";

export function TeamForm({
  team,
  sources,
}: {
  team?: Team | null;
  sources: Pick<Source, "id" | "name">[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(saveTeam, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      {team && <input type="hidden" name="id" value={team.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <TextInput name="name" required defaultValue={team?.name ?? ""} placeholder="Team Elite" />
        </Field>
        <Field label="Slug" hint="URL-friendly ID. Auto-generated from the name if left blank.">
          <TextInput name="slug" defaultValue={team?.slug ?? ""} placeholder="team-elite" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Region">
          <TextInput name="region" defaultValue={team?.region ?? ""} placeholder="South Asia" />
        </Field>
        <Field label="Country">
          <TextInput name="country" defaultValue={team?.country ?? ""} placeholder="Bangladesh" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Logo URL" hint="Only use logos you have the right to use.">
          <TextInput name="logoUrl" type="url" defaultValue={team?.logoUrl ?? ""} placeholder="https://…" />
        </Field>
        <Field label="Website URL">
          <TextInput name="websiteUrl" type="url" defaultValue={team?.websiteUrl ?? ""} placeholder="https://…" />
        </Field>
      </div>
      <Field label="Verification status">
        <VerificationSelect defaultValue={team?.verifiedStatus} />
      </Field>
      <Field label="Description">
        <TextArea name="description" defaultValue={team?.description ?? ""} />
      </Field>
      <Field label="Source" hint="Where this information came from.">
        <SourceSelect sources={sources} defaultValue={team?.sourceId} />
      </Field>
      <FormError error={state.error} />
      <div className="flex gap-3">
        <SubmitButton label={team ? "Save changes" : "Create team"} />
        <CancelLink href="/admin/teams" />
      </div>
    </form>
  );
}
