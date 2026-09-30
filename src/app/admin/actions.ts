"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminGame, logAudit, requireAdmin } from "@/lib/admin";

export type ActionResult = { ok: boolean; error?: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const verificationSchema = z.enum(["UNVERIFIED", "VERIFIED", "DISPUTED", "OUTDATED"]);
const tournamentStatusSchema = z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]);

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Reads a trimmed string from FormData; empty/missing becomes undefined. */
function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

const baseFields = {
  name: z.string().min(1, "Name is required").max(160),
  slug: z.string().max(160).optional(),
  description: z.string().max(8000).optional(),
  verifiedStatus: verificationSchema,
  sourceId: z.string().min(1).optional(),
};

const optionalUrl = (label: string) =>
  z
    .string()
    .max(500)
    .optional()
    .refine((v) => v === undefined || /^https?:\/\/.+\..+/.test(v), {
      message: `${label} must be a valid URL starting with http(s)://`,
    });

type BaseData = {
  name: string;
  slug?: string;
  description?: string;
  verifiedStatus: z.infer<typeof verificationSchema>;
  sourceId?: string;
};

function baseData(p: BaseData, name: string) {
  return {
    name: p.name,
    slug: p.slug ? slugify(p.slug) : slugify(name),
    description: p.description ?? null,
    verifiedStatus: p.verifiedStatus,
    verifiedAt: p.verifiedStatus === "VERIFIED" ? new Date() : null,
    sourceId: p.sourceId ?? null,
  };
}

function uniqueError(e: unknown): ActionResult | null {
  if (e instanceof Error && /unique|Unique/i.test(e.message)) {
    return { ok: false, error: "An item with that slug already exists. Pick a different slug." };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

const weaponSchema = z.object({
  ...baseFields,
  category: z.string().min(1, "Category is required").max(40),
});

export async function saveWeapon(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const parsed = weaponSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    category: str(formData, "category"),
    description: str(formData, "description"),
    verifiedStatus: str(formData, "verifiedStatus") ?? "UNVERIFIED",
    sourceId: str(formData, "sourceId"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const game = await getAdminGame();
  const data = { ...baseData(parsed.data, parsed.data.name), category: parsed.data.category };
  try {
    if (id) {
      const updated = await db().weapon.update({ where: { id }, data });
      await logAudit("update", "weapon", updated.id, `Updated weapon: ${updated.name}`, admin.id);
    } else {
      const created = await db().weapon.create({ data: { ...data, gameId: game.id } });
      await logAudit("create", "weapon", created.id, `Created weapon: ${created.name}`, admin.id);
    }
  } catch (e) {
    return uniqueError(e) ?? { ok: false, error: "Could not save the weapon." };
  }
  revalidatePath("/admin/weapons");
  revalidatePath("/admin/verify");
  redirect("/admin/weapons");
}

export async function deleteWeapon(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const existing = await db().weapon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Weapon not found." };
  await db().weapon.delete({ where: { id } });
  await logAudit("delete", "weapon", id, `Deleted weapon: ${existing.name}`, admin.id);
  revalidatePath("/admin/weapons");
  revalidatePath("/admin/verify");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Tournaments
// ---------------------------------------------------------------------------

const tournamentSchema = z.object({
  ...baseFields,
  region: z.string().max(80).optional(),
  organizer: z.string().max(160).optional(),
  format: z.string().max(160).optional(),
  status: tournamentStatusSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  prizePool: z.string().max(80).optional(),
  officialUrl: optionalUrl("Official URL"),
  streamUrl: optionalUrl("Stream URL"),
});

export async function saveTournament(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const parsed = tournamentSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    verifiedStatus: str(formData, "verifiedStatus") ?? "UNVERIFIED",
    sourceId: str(formData, "sourceId"),
    region: str(formData, "region"),
    organizer: str(formData, "organizer"),
    format: str(formData, "format"),
    status: str(formData, "status") ?? "UPCOMING",
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    prizePool: str(formData, "prizePool"),
    officialUrl: str(formData, "officialUrl"),
    streamUrl: str(formData, "streamUrl"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const game = await getAdminGame();
  const data = {
    ...baseData(parsed.data, parsed.data.name),
    region: parsed.data.region ?? null,
    organizer: parsed.data.organizer ?? null,
    format: parsed.data.format ?? null,
    status: parsed.data.status,
    startDate: parsed.data.startDate ?? null,
    endDate: parsed.data.endDate ?? null,
    prizePool: parsed.data.prizePool ?? null,
    officialUrl: parsed.data.officialUrl ?? null,
    streamUrl: parsed.data.streamUrl ?? null,
  };
  try {
    if (id) {
      const updated = await db().tournament.update({ where: { id }, data });
      await logAudit(
        "update",
        "tournament",
        updated.id,
        `Updated tournament: ${updated.name}`,
        admin.id
      );
    } else {
      const created = await db().tournament.create({ data: { ...data, gameId: game.id } });
      await logAudit(
        "create",
        "tournament",
        created.id,
        `Created tournament: ${created.name}`,
        admin.id
      );
    }
  } catch (e) {
    return uniqueError(e) ?? { ok: false, error: "Could not save the tournament." };
  }
  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/verify");
  redirect("/admin/tournaments");
}

export async function deleteTournament(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const existing = await db().tournament.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Tournament not found." };
  await db().tournament.delete({ where: { id } });
  await logAudit("delete", "tournament", id, `Deleted tournament: ${existing.name}`, admin.id);
  revalidatePath("/admin/tournaments");
  revalidatePath("/admin/verify");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

const teamSchema = z.object({
  ...baseFields,
  region: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  logoUrl: optionalUrl("Logo URL"),
  websiteUrl: optionalUrl("Website URL"),
});

export async function saveTeam(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const parsed = teamSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    verifiedStatus: str(formData, "verifiedStatus") ?? "UNVERIFIED",
    sourceId: str(formData, "sourceId"),
    region: str(formData, "region"),
    country: str(formData, "country"),
    logoUrl: str(formData, "logoUrl"),
    websiteUrl: str(formData, "websiteUrl"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const game = await getAdminGame();
  const data = {
    ...baseData(parsed.data, parsed.data.name),
    region: parsed.data.region ?? null,
    country: parsed.data.country ?? null,
    logoUrl: parsed.data.logoUrl ?? null,
    websiteUrl: parsed.data.websiteUrl ?? null,
  };
  try {
    if (id) {
      const updated = await db().team.update({ where: { id }, data });
      await logAudit("update", "team", updated.id, `Updated team: ${updated.name}`, admin.id);
    } else {
      const created = await db().team.create({ data: { ...data, gameId: game.id } });
      await logAudit("create", "team", created.id, `Created team: ${created.name}`, admin.id);
    }
  } catch (e) {
    return uniqueError(e) ?? { ok: false, error: "Could not save the team." };
  }
  revalidatePath("/admin/teams");
  revalidatePath("/admin/verify");
  redirect("/admin/teams");
}

export async function deleteTeam(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const existing = await db().team.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Team not found." };
  await db().team.delete({ where: { id } });
  await logAudit("delete", "team", id, `Deleted team: ${existing.name}`, admin.id);
  revalidatePath("/admin/teams");
  revalidatePath("/admin/verify");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------

const mapSchema = z.object({
  ...baseFields,
  theme: z.string().max(80).optional(),
  imageUrl: optionalUrl("Image URL"),
  imageCredit: z.string().max(300).optional(),
});

export async function saveMap(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = str(formData, "id");
  const parsed = mapSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    verifiedStatus: str(formData, "verifiedStatus") ?? "UNVERIFIED",
    sourceId: str(formData, "sourceId"),
    theme: str(formData, "theme"),
    imageUrl: str(formData, "imageUrl"),
    imageCredit: str(formData, "imageCredit"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const game = await getAdminGame();
  const data = {
    ...baseData(parsed.data, parsed.data.name),
    theme: parsed.data.theme ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    imageCredit: parsed.data.imageCredit ?? null,
  };
  try {
    if (id) {
      const updated = await db().map.update({ where: { id }, data });
      await logAudit("update", "map", updated.id, `Updated map: ${updated.name}`, admin.id);
    } else {
      const created = await db().map.create({ data: { ...data, gameId: game.id } });
      await logAudit("create", "map", created.id, `Created map: ${created.name}`, admin.id);
    }
  } catch (e) {
    return uniqueError(e) ?? { ok: false, error: "Could not save the map." };
  }
  revalidatePath("/admin/maps");
  revalidatePath("/admin/verify");
  redirect("/admin/maps");
}

export async function deleteMap(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const existing = await db().map.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Map not found." };
  await db().map.delete({ where: { id } });
  await logAudit("delete", "map", id, `Deleted map: ${existing.name}`, admin.id);
  revalidatePath("/admin/maps");
  revalidatePath("/admin/verify");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Verify queue
// ---------------------------------------------------------------------------

export async function verifyItem(
  entityType: "weapon" | "tournament" | "team" | "map",
  id: string
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const data = { verifiedStatus: "VERIFIED" as const, verifiedAt: new Date() };
  let name = id;
  switch (entityType) {
    case "weapon": {
      const r = await db().weapon.update({ where: { id }, data });
      name = r.name;
      break;
    }
    case "tournament": {
      const r = await db().tournament.update({ where: { id }, data });
      name = r.name;
      break;
    }
    case "team": {
      const r = await db().team.update({ where: { id }, data });
      name = r.name;
      break;
    }
    case "map": {
      const r = await db().map.update({ where: { id }, data });
      name = r.name;
      break;
    }
    default:
      return { ok: false, error: "Unknown entity type." };
  }
  await logAudit("verify", entityType, id, `Verified ${entityType}: ${name}`, admin.id);
  revalidatePath("/admin/verify");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// CSV import → weapons (always UNVERIFIED)
// ---------------------------------------------------------------------------

const csvRowSchema = z.object({
  name: z.string().min(1, "Row is missing a name").max(160),
  slug: z.string().max(160).optional(),
  category: z.string().max(40).optional(),
  description: z.string().max(8000).optional(),
});

export async function importWeapons(rows: unknown): Promise<
  { ok: true; created: number; skipped: string[] } | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  const parsed = z.array(csvRowSchema).min(1, "No rows to import").max(500).safeParse(rows);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid rows." };
  }
  const game = await getAdminGame();
  let created = 0;
  const skipped: string[] = [];
  for (const row of parsed.data) {
    const name = row.name.trim();
    const slug = row.slug?.trim() ? slugify(row.slug) : slugify(name);
    try {
      const weapon = await db().weapon.create({
        data: {
          gameId: game.id,
          name,
          slug,
          category: row.category?.trim() || "Unknown",
          description: row.description?.trim() || null,
          verifiedStatus: "UNVERIFIED",
          isDemo: false,
        },
      });
      await logAudit("import", "weapon", weapon.id, `CSV import: ${weapon.name}`, admin.id);
      created++;
    } catch {
      skipped.push(name);
    }
  }
  revalidatePath("/admin/weapons");
  revalidatePath("/admin/verify");
  revalidatePath("/admin");
  return { ok: true, created, skipped };
}
