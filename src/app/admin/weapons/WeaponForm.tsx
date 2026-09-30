"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Source, Weapon } from "@prisma/client";
import { saveWeapon, type ActionResult } from "../actions";
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

const CATEGORIES = [
  "AR",
  "SMG",
  "Shotgun",
  "Sniper",
  "DMR",
  "LMG",
  "Pistol",
  "Melee",
  "Launcher",
  "Special",
];

export function WeaponForm({
  weapon,
  sources,
}: {
  weapon?: Weapon | null;
  sources: Pick<Source, "id" | "name">[];
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(saveWeapon, { ok: false });

  return (
    <form action={formAction} className="space-y-5">
      {weapon && <input type="hidden" name="id" value={weapon.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name">
          <TextInput name="name" required defaultValue={weapon?.name ?? ""} placeholder="M1887" />
        </Field>
        <Field label="Slug" hint="URL-friendly ID. Auto-generated from the name if left blank.">
          <TextInput name="slug" defaultValue={weapon?.slug ?? ""} placeholder="m1887" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category">
          <SelectInput name="category" required defaultValue={weapon?.category ?? "AR"}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Verification status">
          <VerificationSelect defaultValue={weapon?.verifiedStatus} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea
          name="description"
          defaultValue={weapon?.description ?? ""}
          placeholder="Short, original description…"
        />
      </Field>
      <Field label="Source" hint="Where this information came from.">
        <SourceSelect sources={sources} defaultValue={weapon?.sourceId} />
      </Field>
      <FormError error={state.error} />
      <div className="flex gap-3">
        <SubmitButton label={weapon ? "Save changes" : "Create weapon"} />
        <CancelLink href="/admin/weapons" />
      </div>
      <p className="text-xs text-zinc-500">
        <Link href="/admin/weapons" className="underline hover:text-zinc-300">
          Back to list
        </Link>{" "}
        without saving.
      </p>
    </form>
  );
}
