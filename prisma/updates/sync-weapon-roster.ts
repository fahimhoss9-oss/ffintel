/**
 * Post-seed data sync — inserts source/weapon rows the main seed skips.
 *
 * prisma/seed.ts skips entirely when the database already has content, so it
 * never overwrites admin edits. That also means demo rows added LATER (new
 * weapons, new sources) would never reach an existing database.
 *
 * This script is INSERT-ONLY: it creates rows that don't exist yet and never
 * modifies or deletes existing ones, so admin edits are always safe. It is
 * idempotent and runs on every deploy (see the `build` script).
 *
 * Run manually with:  npx tsx prisma/updates/sync-weapon-roster.ts
 */
import { PrismaClient } from "@prisma/client";
import { demoSources, demoWeapons } from "../../src/data/demo";

const prisma = new PrismaClient();

async function main() {
  // Sources first — weapons reference them.
  let sourcesCreated = 0;
  for (const s of demoSources) {
    const existing = await prisma.source.findUnique({ where: { id: s.id } });
    if (!existing) {
      await prisma.source.create({ data: { ...s } });
      sourcesCreated++;
    }
  }

  let weaponsCreated = 0;
  for (const w of demoWeapons) {
    const { stats, ...weapon } = w;
    const existing = await prisma.weapon.findUnique({
      where: { gameId_slug: { gameId: weapon.gameId, slug: weapon.slug } },
    });
    if (!existing) {
      await prisma.weapon.create({
        data: {
          ...weapon,
          stats: {
            create: stats.map((st) => {
              const { gameVersion: _gv, ...stat } = st;
              return stat;
            }),
          },
        },
      });
      weaponsCreated++;
    }
  }

  console.log(
    `Sync complete — sources created: ${sourcesCreated}, weapons created: ${weaponsCreated}.`,
  );
}

main()
  .catch((e) => {
    console.error("Sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
