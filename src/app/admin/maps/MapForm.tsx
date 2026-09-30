"use client";

import { useActionState } from "react";
import type { Map, Source } from "@prisma/client";
import { saveMap, type ActionResult } from "../actions";
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

export function MapForm({
  map,
  sources,
}: {
  map?: Map | null;
  sources: Pick<Source, "id" | "name">[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(saveMap, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      {map && <input type="hidden" name="id" value={map.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <TextInput name="name" required defaultValue={map?.name ?? ""} placeholder="Bermuda" />
        </Field>
        <Field label="Slug" hint="URL-friendly ID. Auto-generated from the name if left blank.">
          <TextInput name="slug" defaultValue={map?.slug ?? ""} placeholder="bermuda" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Theme">
          <TextInput name="theme" defaultValue={map?.theme ?? ""} placeholder="Tropical island" />
        </Field>
        <Field label="Verification status">
          <VerificationSelect defaultValue={map?.verifiedStatus} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Image URL"
          hint="Use original schematic artwork, or licensed art with credit below."
        >
          <TextInput name="imageUrl" type="url" defaultValue={map?.imageUrl ?? ""} placeholder="https://…" />
        </Field>
        <Field label="Image credit">
          <TextInput
            name="imageCredit"
            defaultValue={map?.imageCredit ?? ""}
            placeholder="Original schematic · FFIntel"
          />
        </Field>
      </div>
      <Field label="Description">
        <TextArea name="description" defaultValue={map?.description ?? ""} />
      </Field>
      <Field label="Source" hint="Where this information came from.">
        <SourceSelect sources={sources} defaultValue={map?.sourceId} />
      </Field>
      <FormError error={state.error} />
      <div className="flex gap-3">
        <SubmitButton label={map ? "Save changes" : "Create map"} />
        <CancelLink href="/admin/maps" />
      </div>
    </form>
  );
}
