/**
 * Data-access layer. Single entry point for all page/route data fetching.
 *
 * - When DATABASE_URL is configured → reads from Postgres via Prisma.
 * - When it is NOT configured → serves the bundled demo dataset with
 *   isDemo labels, so the app runs and builds without any setup.
 *
 * Pages must treat every record's verifiedStatus / isDemo honestly in the UI.
 */
import {
  demoCharacters,
  demoGame,
  demoMaps,
  demoMatches,
  demoPlayers,
  demoSources,
  demoTeams,
  demoTournaments,
  demoVersions,
  demoWeapons,
  type MapWithLocations,
  type WeaponWithStats,
} from "@/data/demo";
import { db } from "@/lib/db";

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export async function getGame() {
  if (isDemoMode()) return demoGame;
  const game = await db().game.findUnique({ where: { slug: "free-fire" } });
  return game ?? demoGame;
}

export async function getCurrentVersion() {
  if (isDemoMode()) return demoVersions.find((v) => v.isCurrent) ?? demoVersions[0];
  const game = await getGame();
  return db().gameVersion.findFirst({
    where: { gameId: game.id, isCurrent: true },
  });
}

export async function getWeapons(): Promise<WeaponWithStats[]> {
  if (isDemoMode()) return demoWeapons;
  const game = await getGame();
  const current = await getCurrentVersion();
  return db().weapon.findMany({
    where: { gameId: game.id },
    include: {
      stats: {
        where: current ? { gameVersionId: current.id } : undefined,
        include: { gameVersion: true },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  }) as Promise<WeaponWithStats[]>;
}

export async function getWeapon(slug: string): Promise<WeaponWithStats | null> {
  if (isDemoMode()) return demoWeapons.find((w) => w.slug === slug) ?? null;
  const game = await getGame();
  const weapon = await db().weapon.findUnique({
    where: { gameId_slug: { gameId: game.id, slug } },
    include: { stats: { include: { gameVersion: true }, orderBy: { createdAt: "desc" } } },
  });
  return weapon as WeaponWithStats | null;
}

export async function getMaps(): Promise<MapWithLocations[]> {
  if (isDemoMode()) return demoMaps;
  const game = await getGame();
  return db().map.findMany({
    where: { gameId: game.id },
    include: { locations: { include: { loot: true } } },
    orderBy: { name: "asc" },
  }) as Promise<MapWithLocations[]>;
}

export async function getMap(slug: string): Promise<MapWithLocations | null> {
  if (isDemoMode()) return demoMaps.find((m) => m.slug === slug) ?? null;
  const game = await getGame();
  const map = await db().map.findUnique({
    where: { gameId_slug: { gameId: game.id, slug } },
    include: { locations: { include: { loot: true } } },
  });
  return map as MapWithLocations | null;
}

export async function getTournaments(status?: string) {
  if (isDemoMode())
    return status ? demoTournaments.filter((t) => t.status === status) : demoTournaments;
  const game = await getGame();
  return db().tournament.findMany({
    where: { gameId: game.id, ...(status ? { status: status as never } : {}) },
    include: {
      teams: { include: { team: true } },
      livestreams: true,
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getTournament(slug: string) {
  if (isDemoMode()) return demoTournaments.find((t) => t.slug === slug) ?? null;
  const game = await getGame();
  return db().tournament.findUnique({
    where: { gameId_slug: { gameId: game.id, slug } },
    include: {
      teams: { include: { team: true }, orderBy: { placement: "asc" } },
      matches: { include: { results: { include: { team: true } } }, orderBy: { scheduledAt: "asc" } },
      livestreams: true,
    },
  });
}

export async function getTeams() {
  if (isDemoMode()) return demoTeams;
  const game = await getGame();
  return db().team.findMany({
    where: { gameId: game.id },
    include: { players: true },
    orderBy: { name: "asc" },
  });
}

export async function getTeam(slug: string) {
  if (isDemoMode()) return demoTeams.find((t) => t.slug === slug) ?? null;
  const game = await getGame();
  return db().team.findUnique({
    where: { gameId_slug: { gameId: game.id, slug } },
    include: { players: true },
  });
}

export async function getPlayers() {
  if (isDemoMode()) return demoPlayers;
  const game = await getGame();
  return db().player.findMany({
    where: { gameId: game.id },
    include: { team: true },
    orderBy: { ign: "asc" },
  });
}

export async function getCharacters() {
  if (isDemoMode()) return demoCharacters;
  const game = await getGame();
  return db().character.findMany({
    where: { gameId: game.id },
    include: { abilities: true },
    orderBy: { name: "asc" },
  });
}

export async function getMatches() {
  if (isDemoMode()) return demoMatches;
  const tournaments = await getTournaments();
  const ids = tournaments.map((t) => t.id);
  if (ids.length === 0) return [];
  return db().match.findMany({
    where: { tournamentId: { in: ids } },
    include: { tournament: true, results: { include: { team: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });
}

/** Global search across entity types. Demo mode searches the demo dataset. */
export async function searchAll(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (isDemoMode()) {
    const results: { type: string; title: string; href: string; subtitle?: string }[] = [];
    for (const w of demoWeapons)
      if (w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q))
        results.push({ type: "Weapon", title: w.name, href: `/weapons/${w.slug}`, subtitle: w.category });
    for (const m of demoMaps)
      if (m.name.toLowerCase().includes(q))
        results.push({ type: "Map", title: m.name, href: `/maps/${m.slug}` });
    for (const t of demoTournaments)
      if (t.name.toLowerCase().includes(q))
        results.push({ type: "Tournament", title: t.name, href: `/esports/tournaments/${t.slug}` });
    for (const t of demoTeams)
      if (t.name.toLowerCase().includes(q))
        results.push({ type: "Team", title: t.name, href: `/esports/teams/${t.slug}` });
    return results.slice(0, 30);
  }
  // Live mode: Postgres full-text-ish search via case-insensitive contains.
  const game = await getGame();
  const [weapons, maps, tournaments, teams] = await Promise.all([
    db().weapon.findMany({ where: { gameId: game.id, name: { contains: q, mode: "insensitive" } }, take: 10 }),
    db().map.findMany({ where: { gameId: game.id, name: { contains: q, mode: "insensitive" } }, take: 10 }),
    db().tournament.findMany({ where: { gameId: game.id, name: { contains: q, mode: "insensitive" } }, take: 10 }),
    db().team.findMany({ where: { gameId: game.id, name: { contains: q, mode: "insensitive" } }, take: 10 }),
  ]);
  return [
    ...weapons.map((w) => ({ type: "Weapon", title: w.name, href: `/weapons/${w.slug}`, subtitle: w.category })),
    ...maps.map((m) => ({ type: "Map", title: m.name, href: `/maps/${m.slug}` })),
    ...tournaments.map((t) => ({ type: "Tournament", title: t.name, href: `/esports/tournaments/${t.slug}` })),
    ...teams.map((t) => ({ type: "Team", title: t.name, href: `/esports/teams/${t.slug}` })),
  ];
}

export function getSources() {
  return demoSources;
}
