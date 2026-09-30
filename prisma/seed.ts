/**
 * Prisma seed script — upserts the demo dataset (src/data/demo.ts) into Postgres.
 *
 * Idempotent: every record is upserted by a unique key, so re-running the
 * seed never creates duplicates.
 *
 * Run with:  npx tsx prisma/seed.ts   (requires DATABASE_URL)
 * Or via:    npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import {
  demoCharacters,
  demoGame,
  demoMaps,
  demoPlayers,
  demoSources,
  demoTeams,
  demoTournaments,
  demoVersions,
  demoWeapons,
} from "../src/data/demo";

const prisma = new PrismaClient();

type WithId = { id: string };

/** Strips the primary key for `update` payloads (Prisma forbids updating `id`). */
function updateData<T extends WithId>(row: T): Omit<T, "id"> {
  const { id: _id, ...rest } = row;
  return rest;
}

async function main() {
  // Skip when the database already has content (e.g. on redeploys), so that
  // content edited through the admin panel is never overwritten by demo data.
  // NOTE: this must check the LAST entity the seed writes (tournaments), not
  // the first — a previously interrupted seed may have left partial data,
  // which must be completed by re-running the (idempotent) upserts below.
  const existingTournaments = await prisma.tournament.count();
  if (existingTournaments > 0) {
    console.log("Database already contains data - skipping seed.");
    return;
  }

  // --- Game ----------------------------------------------------------------
  // All-or-nothing: the whole seed runs inside one transaction, so a failure
  // rolls everything back instead of leaving partial data behind. The next
  // deploy then cleanly re-runs the full seed.
  await prisma.$transaction(
    async (tx) => {
  const { id: _gameId, ...gameUpdate } = demoGame;
  await tx.game.upsert({
    where: { slug: demoGame.slug },
    create: { ...demoGame },
    update: gameUpdate,
  });

  // --- Game versions --------------------------------------------------------
  for (const v of demoVersions) {
    await tx.gameVersion.upsert({
      where: { gameId_version: { gameId: v.gameId, version: v.version } },
      create: { ...v },
      update: updateData(v),
    });
  }

  // --- Sources ---------------------------------------------------------------
  for (const s of demoSources) {
    await tx.source.upsert({
      where: { id: s.id },
      create: { ...s },
      update: updateData(s),
    });
  }

  // --- Weapons + per-patch stats ----------------------------------------------
  for (const w of demoWeapons) {
    const { stats, ...weapon } = w;
    await tx.weapon.upsert({
      where: { gameId_slug: { gameId: weapon.gameId, slug: weapon.slug } },
      create: { ...weapon },
      update: updateData(weapon),
    });
    for (const st of stats) {
      const { gameVersion: _gv, ...stat } = st;
      await tx.weaponStat.upsert({
        where: {
          weaponId_gameVersionId: {
            weaponId: stat.weaponId,
            gameVersionId: stat.gameVersionId,
          },
        },
        create: { ...stat },
        update: updateData(stat),
      });
    }
  }

  // --- Maps + locations + loot -------------------------------------------------
  for (const m of demoMaps) {
    const { locations, ...map } = m;
    await tx.map.upsert({
      where: { gameId_slug: { gameId: map.gameId, slug: map.slug } },
      create: { ...map },
      update: updateData(map),
    });
    for (const loc of locations) {
      const { loot, ...location } = loc;
      await tx.mapLocation.upsert({
        where: { mapId_slug: { mapId: location.mapId, slug: location.slug } },
        create: { ...location },
        update: updateData(location),
      });
      for (const l of loot) {
        await tx.loot.upsert({
          where: { id: l.id },
          create: { ...l },
          update: updateData(l),
        });
      }
    }
  }

  // --- Characters + abilities ----------------------------------------------------
  for (const c of demoCharacters) {
    const { abilities, ...character } = c;
    await tx.character.upsert({
      where: { gameId_slug: { gameId: character.gameId, slug: character.slug } },
      create: { ...character },
      update: updateData(character),
    });
    for (const a of abilities) {
      await tx.characterAbility.upsert({
        where: { id: a.id },
        create: { ...a },
        update: updateData(a),
      });
    }
  }

  // --- Esports: teams, players, tournaments ---------------------------------------
  for (const t of demoTeams) {
    await tx.team.upsert({
      where: { gameId_slug: { gameId: t.gameId, slug: t.slug } },
      create: { ...t },
      update: updateData(t),
    });
  }

  for (const p of demoPlayers) {
    await tx.player.upsert({
      where: { id: p.id },
      create: { ...p },
      update: updateData(p),
    });
  }

  for (const tr of demoTournaments) {
    await tx.tournament.upsert({
      where: { gameId_slug: { gameId: tr.gameId, slug: tr.slug } },
      create: { ...tr },
      update: updateData(tr),
    });
  }
    },
    { maxWait: 15000, timeout: 120000 },
  );

  console.log("Seed complete: game, versions, sources, weapons, maps, characters, esports.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
