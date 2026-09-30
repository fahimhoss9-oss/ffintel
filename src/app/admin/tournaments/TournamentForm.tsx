"use client";

import { useActionState } from "react";
import type { Source, Tournament } from "@prisma/client";
import { saveTournament, type ActionResult } from "../actions";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  SubmitButton,
  CancelLink,
  FormError,
  SourceSelect,
  VerificationSelect,
} from "../shared";

const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

function dateValue(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function TournamentForm({
  tournament,
  sources,
}: {
  tournament?: Tournament | null;
  sources: Pick<Source, "id" | "name">[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(saveTournament, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      {tournament && <input type="hidden" name="id" value={tournament.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <TextInput
            name="name"
            required
            defaultValue={tournament?.name ?? ""}
            placeholder="FFWS 2026 Global Finals"
          />
        </Field>
        <Field label="Slug" hint="URL-friendly ID. Auto-generated from the name if left blank.">
          <TextInput name="slug" defaultValue={tournament?.slug ?? ""} placeholder="ffws-2026-global-finals" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Region">
          <TextInput name="region" defaultValue={tournament?.region ?? ""} placeholder="Bangladesh" />
        </Field>
        <Field label="Organizer">
          <TextInput name="organizer" defaultValue={tournament?.organizer ?? ""} placeholder="Garena" />
        </Field>
        <Field label="Format">
          <TextInput name="format" defaultValue={tournament?.format ?? ""} placeholder="Battle Royale · 18 teams" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Status">
          <SelectInput name="status" defaultValue={tournament?.status ?? "UPCOMING"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Start date">
          <TextInput name="startDate" type="date" defaultValue={dateValue(tournament?.startDate)} />
        </Field>
        <Field label="End date">
          <TextInput name="endDate" type="date" defaultValue={dateValue(tournament?.endDate)} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prize pool">
          <TextInput name="prizePool" defaultValue={tournament?.prizePool ?? ""} placeholder="$1,000,000" />
        </Field>
        <Field label="Verification status">
          <VerificationSelect defaultValue={tournament?.verifiedStatus} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Official URL">
          <TextInput
            name="officialUrl"
            type="url"
            defaultValue={tournament?.officialUrl ?? ""}
            placeholder="https://…"
          />
        </Field>
        <Field label="Stream URL" hint="Official YouTube stream/video URL.">
          <TextInput
            name="streamUrl"
            type="url"
            defaultValue={tournament?.streamUrl ?? ""}
            placeholder="https://youtube.com/…"
          />
        </Field>
      </div>
      <Field label="Description">
        <TextArea name="description" defaultValue={tournament?.description ?? ""} />
      </Field>
      <Field label="Source" hint="Where this information came from.">
        <SourceSelect sources={sources} defaultValue={tournament?.sourceId} />
      </Field>
      <FormError error={state.error} />
      <div className="flex gap-3">
        <SubmitButton label={tournament ? "Save changes" : "Create tournament"} />
        <CancelLink href="/admin/tournaments" />
      </div>
    </form>
  );
}
