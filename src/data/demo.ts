/**
 * Demo dataset — used when no DATABASE_URL is configured, and as the source
 * for `prisma/seed.ts` when seeding a real database.
 *
 * DATA RULES (strict):
 *  - Never invent statistics. Numeric fields with no citable source stay null.
 *  - Rows with placeholder/illustrative content set isDemo = true AND
 *    verifiedStatus = "UNVERIFIED". The UI renders a DEMO badge for these.
 *  - Every row carries a sourceId pointing at demoSources.
 */
import type {
  Character,
  CharacterAbility,
  Game,
  GameVersion,
  Loot,
  Map,
  MapLocation,
  Match,
  Player,
  Source,
  Team,
  Tournament,
  Weapon,
  WeaponStat,
} from "@prisma/client";

const NOW = new Date("2026-09-30");

export const demoSources: Source[] = [
  {
    id: "src-garena-weapons",
    name: "Garena Free Fire — Official Weapons Page",
    url: "https://ff.garena.com/en/weapons/",
    type: "official",
    collectedAt: new Date("2026-09-30"),
    notes:
      "Official weapon roster, categories, descriptions and magazine capacities.",
  },
  {
    id: "src-garena-maps",
    name: "Garena Free Fire — Official Maps Page",
    url: "https://ff.garena.com/en/maps/",
    type: "official",
    collectedAt: new Date("2026-09-30"),
    notes: "Official map list and descriptions.",
  },
  {
    id: "src-demo",
    name: "Demo / placeholder",
    url: null,
    type: "demo",
    collectedAt: new Date("2026-09-30"),
    notes: "Illustrative placeholder content. Not real game data.",
  },
  {
    id: "src-ob55-news",
    name: "Free Fire press coverage — OB55 launch (Sep 2026)",
    url: "https://www.sportsdunia.com/gaming/free-fire-ob55-update-download",
    type: "news",
    collectedAt: new Date("2026-09-30"),
    notes:
      "OB55 released Sep 16, 2026 (Garena patch notes published Sep 10). New weapons M7, Skorp, RPK, Hawk debuting in Clash Squad; Kenta rework.",
  },
  {
    id: "src-sportskeeda-bd-spring",
    name: "Sportskeeda — FFWS 2026 Bangladesh Spring results",
    url: "https://www.sportskeeda.com/free-fire/news-ffws-2026-bangladesh-spring-winners-qualified-teams-ewc-prize-pool-distribution",
    type: "news",
    collectedAt: new Date("2026-09-30"),
    notes:
      "Straw Hats Esports won the Grand Finals (151 pts, 2 Booyahs, 94 eliminations); Titan Esports Club runner-up.",
  },
  {
    id: "src-sportskeeda-bd-fall",
    name: "Sportskeeda — FFWS 2026 Bangladesh Fall results",
    url: "https://www.sportskeeda.com/free-fire/news-ffws-2026-bangladesh-fall-winner-results-prize-pool-qualified-teams-global-finals",
    type: "news",
    collectedAt: new Date("2026-09-30"),
    notes:
      "Team Infinity champion (165 pts, 3 Booyahs, $16,275); Pirate Esports 2nd (155 pts, $9,765). Grand Finals Sep 5, 2026. Top 2 qualified for the Global Finals in Thailand (Nov 2026).",
  },
  {
    id: "src-sportskeeda-sea-fall",
    name: "Sportskeeda — FFWS 2026 SEA Fall results",
    url: "https://www.sportskeeda.com/free-fire/news-ffws-2026-sea-fall-winner-prize-pool-distribution-qualified-teams-global-finals",
    type: "news",
    collectedAt: new Date("2026-09-30"),
    notes:
      "Bigetron by Vitality champion ($100,000); Kojaa named Grand Finals MVP ($4,000). Ended Sep 20, 2026; top 8 qualified for the Global Finals.",
  },
  {
    id: "src-sportskeeda-usa-spring",
    name: "Sportskeeda — FFWS 2026 USA Spring results",
    url: "https://www.sportskeeda.com/free-fire/news-free-fire-world-series-ffws-2026-usa-spring-winners-prize-pool-distribution-highlights",
    type: "news",
    collectedAt: new Date("2026-09-30"),
    notes:
      "MiA Corp champion ($10,000; 107 pts, 2 Booyahs, 61 eliminations). $30,000 total prize pool; top 6 qualified for FFWS 2026 USA Summer.",
  },
  {
    id: "src-liquipedia-pk-2026",
    name: "Liquipedia — FFWS Pakistan 2026 Spring",
    url: "https://liquipedia.net/freefire/Free_Fire_World_Series/Pakistan/2026/Spring",
    type: "wiki",
    collectedAt: new Date("2026-09-30"),
    notes: "DP Dominators won with 303 points (CC-BY-SA community wiki).",
  },
  {
    id: "src-liquipedia-sea-2026-spring",
    name: "Liquipedia — FFWS Southeast Asia 2026 Spring",
    url: "https://liquipedia.net/freefire/Free_Fire_World_Series/Southeast_Asia/2026/Spring",
    type: "wiki",
    collectedAt: new Date("2026-09-30"),
    notes: "Buriram United Esports won with 371 points (CC-BY-SA community wiki).",
  },
  {
    id: "src-community-wiki",
    name: "Free Fire community knowledge (unverified)",
    url: "https://freefire.fandom.com",
    type: "community",
    collectedAt: new Date("2026-09-30"),
    notes:
      "Character ability descriptions from community knowledge; not verified against official sources.",
  },
];

export const demoGame: Game = {
  id: "game-freefire",
  slug: "free-fire",
  name: "Free Fire",
  shortName: "FF",
  description:
    "Garena Free Fire battle royale — weapons, maps, esports and more. Independent fan project.",
  logoUrl: null,
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
};

const verOB54: GameVersion = {
  id: "ver-ob54",
  gameId: demoGame.id,
  version: "OB54",
  title: "OB54 — 9th Anniversary cycle",
  releaseDate: null,
  notes:
    "Patch cycle preceding OB55 (mid-2026). Details pending verification against official patch notes.",
  isCurrent: false,
  createdAt: NOW,
  updatedAt: NOW,
};

const verOB55: GameVersion = {
  id: "ver-ob55",
  gameId: demoGame.id,
  version: "OB55",
  title: "OB55 — NARUTO SHIPPUDEN returns",
  releaseDate: new Date("2026-09-16"),
  notes:
    "Current patch as of Sep 30, 2026. Released Sep 16, 2026 (Garena patch notes published Sep 10). New weapons M7, Skorp, RPK, Hawk debuting in Clash Squad; Kenta rework; Free Fire x NARUTO SHIPPUDEN Chapter 1 returns (Sep 16 – Oct 15, 2026).",
  isCurrent: true,
  createdAt: NOW,
  updatedAt: NOW,
};

export const demoVersions: GameVersion[] = [verOB54, verOB55];

export type WeaponWithStats = Weapon & {
  stats: (WeaponStat & { gameVersion: GameVersion })[];
};

type StatRow = WeaponStat & { gameVersion: GameVersion };

/** Builds an OB55 WeaponStat row whose only numeric value is the official
 *  magazine capacity shown on the Garena weapons page. Every other numeric
 *  field stays null until a citable source exists. */
function officialStat(
  weaponId: string,
  statId: string,
  magazine: number | null,
): StatRow {
  return {
    id: statId,
    weaponId,
    gameVersionId: verOB55.id,
    gameVersion: verOB55,
    damage: null,
    headshotDamage: null,
    bodyDamage: null,
    limbDamage: null,
    fireRate: null,
    magazine,
    reloadTime: null,
    range: null,
    accuracy: null,
    armorPenetration: null,
    movementSpeed: null,
    ammoType: null,
    notes:
      "Magazine capacity as listed on the official Free Fire weapons page. All other numeric stats pending a citable source — not displayed until verified.",
    isDemo: false,
    sourceId: "src-garena-weapons",
    verifiedStatus: "VERIFIED",
    verifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function officialWeapon(
  id: string,
  slug: string,
  name: string,
  category: string,
  description: string,
  magazine: number | null,
  verified: boolean,
): WeaponWithStats {
  return {
    id,
    gameId: demoGame.id,
    slug,
    name,
    category,
    description,
    iconUrl: null,
    isDemo: false,
    sourceId: "src-garena-weapons",
    verifiedStatus: verified ? "VERIFIED" : "UNVERIFIED",
    verifiedAt: verified ? NOW : null,
    createdAt: NOW,
    updatedAt: NOW,
    stats: [officialStat(id, `wps-${slug}-ob55`, magazine)],
  };
}

export const demoWeapons: WeaponWithStats[] = [
  // Placeholder example: numeric stats not citable, so everything stays
  // demo/unverified except the well-known 2-round magazine.
  {
    id: "wpn-m1887",
    gameId: demoGame.id,
    slug: "m1887",
    name: "M1887",
    category: "Shotgun",
    description:
      "Lever-action shotgun known for very high close-range burst damage.",
    iconUrl: null,
    isDemo: true,
    sourceId: "src-garena-weapons",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    stats: [
      {
        id: "wps-m1887-ob55",
        weaponId: "wpn-m1887",
        gameVersionId: verOB55.id,
        gameVersion: verOB55,
        damage: null,
        headshotDamage: null,
        bodyDamage: null,
        limbDamage: null,
        fireRate: null,
        magazine: 2,
        reloadTime: null,
        range: null,
        accuracy: null,
        armorPenetration: null,
        movementSpeed: null,
        ammoType: "SG",
        notes:
          "Numeric stats pending a citable source — not displayed until verified.",
        isDemo: true,
        sourceId: "src-demo",
        verifiedStatus: "UNVERIFIED",
        verifiedAt: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  },
  officialWeapon(
    "wpn-gloo-melter",
    "gloo-melter",
    "Gloo Melter",
    "Projectiles",
    "After explosion, the grenade will create a corrosive range that damages Gloo Walls inside it. Gloo Walls inside the range will also take more damage when attacked.",
    0,
    true,
  ),
  officialWeapon(
    "wpn-shield-gun",
    "shield-gun",
    "Shield Gun",
    "Special",
    "A modified weapon that generates a force field shield that can protect its user from damage. A new shield will generate even if the shield is damaged. (Category 'Special' is provisional — official page grouping unclear.)",
    35,
    false,
  ),
  officialWeapon(
    "wpn-treatment-laser-gun",
    "treatment-laser-gun",
    "Treatment Laser Gun",
    "Special",
    "This weapon can lock aim on a teammate and heal for him/her. Be sure to stay close to your teammate when using it. (Category 'Special' is provisional — official page grouping unclear.)",
    30,
    false,
  ),
  officialWeapon(
    "wpn-trogon",
    "trogon",
    "Trogon",
    "Shotgun",
    "A shotgun with burst mode and grenade mode, which is suitable for both long-range and close-range combat.",
    9,
    true,
  ),
  officialWeapon(
    "wpn-vsk94",
    "vsk94",
    "VSK94",
    "Sniper",
    "A lightweight sniper rifle with a special aiming mechanism.",
    26,
    true,
  ),
  officialWeapon(
    "wpn-fgl-24",
    "fgl-24",
    "FGL-24",
    "Launcher",
    "Its bullets can explode and spray flames.",
    2,
    true,
  ),
  officialWeapon(
    "wpn-m590",
    "m590",
    "M590",
    "Shotgun",
    "A mid-to-close-range powerhouse.",
    1,
    true,
  ),
  officialWeapon(
    "wpn-winchester",
    "winchester",
    "Winchester",
    "Marksman Rifle",
    "A lever-action, fully automatic marksman rifle with a distinctive firing rhythm and reload mechanism.",
    12,
    true,
  ),
  officialWeapon(
    "wpn-m7",
    "m7",
    "M7",
    "Rifle",
    "The M7 is a fully automatic assault rifle with a new recoil system. Unlike weapons that use the existing bullet spread mechanic, the M7's recoil steadily pulls the aim upward while firing.",
    30,
    true,
  ),
  officialWeapon(
    "wpn-skorp",
    "skorp",
    "Skorp",
    "Sub-Machine Gun",
    "The Skorp uses a recoil system similar to the M7. Its high rate of fire and armor penetration keep it effective even in the late game.",
    30,
    true,
  ),
  officialWeapon(
    "wpn-hawk",
    "hawk",
    "Hawk",
    "Sniper",
    "The Hawk is a sniper rifle with a unique firing style. Carrying only two rounds, the Hawk delivers exceptional burst damage with its high rate of fire.",
    2,
    true,
  ),
  officialWeapon(
    "wpn-rpk",
    "rpk",
    "RPK",
    "Machine Gun",
    "Featuring the new recoil system, the fully automatic RPK combines machine-gun firepower with assault-rifle mobility.",
    75,
    true,
  ),
];

export type MapWithLocations = Map & {
  locations: (MapLocation & { loot: Loot[] })[];
};

type LocationRow = MapLocation & { loot: Loot[] };

/** Schematic map location — coordinates are illustrative (0–100), NOT
 *  official geography. Always demo + unverified. */
function schematicLocation(
  mapId: string,
  id: string,
  name: string,
  slug: string,
  x: number,
  y: number,
  type: string,
  description: string,
  loot: Loot[] = [],
): LocationRow {
  return {
    id,
    mapId,
    name,
    slug,
    x,
    y,
    type,
    description: `${description} (Schematic position — illustrative, not official geography.)`,
    isDemo: true,
    sourceId: "src-demo",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    loot,
  };
}

function demoLoot(
  id: string,
  mapLocationId: string,
  category: string,
  tier: string,
  details: string,
): Loot {
  return {
    id,
    mapLocationId,
    gameVersionId: null,
    category,
    tier,
    details: `${details} (Illustrative placeholder.)`,
    isDemo: true,
    sourceId: "src-demo",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const demoMaps: MapWithLocations[] = [
  {
    id: "map-bermuda",
    gameId: demoGame.id,
    slug: "bermuda",
    name: "Bermuda",
    description:
      "The original battle royale map — a tropical island mixing urban areas, factories and open coastline. (Summary; pending verification against official sources.)",
    theme: "Tropical island",
    imageUrl: null, // schematic rendered in-app
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-bermuda", "loc-bermuda-peak", "Peak", "peak", 50, 30, "hot_drop",
        "Central high-ground area; historically a popular hot drop.",
        [
          demoLoot("loot-bermuda-peak-1", "loc-bermuda-peak", "weapon", "high", "Hot-drop area with frequent high-tier weapon spawns"),
          demoLoot("loot-bermuda-peak-2", "loc-bermuda-peak", "armor", "high", "Level 3 armor pieces reported in the area"),
        ],
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-clock-tower", "Clock Tower", "clock-tower", 42, 45, "hot_drop",
        "Dense town center; historically a popular hot drop.",
        [demoLoot("loot-bermuda-clocktower-1", "loc-bermuda-clock-tower", "weapon", "high", "Dense building loot; strong early-game weapons")],
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-factory", "Factory", "factory", 60, 20, "town",
        "Industrial complex in the north of the map.",
        [demoLoot("loot-bermuda-factory-1", "loc-bermuda-factory", "weapon", "high", "Industrial loot spread across warehouses")],
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-bimasakti", "Bimasakti Strip", "bimasakti-strip", 35, 60, "town",
        "Built-up strip in the western part of the map.",
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-pochinok", "Pochinok", "pochinok", 55, 55, "town",
        "Residential town near the center-south of the map.",
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-sentosa", "Sentosa", "sentosa", 70, 75, "compound",
        "Coastal compound in the southeast.",
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-rim-nam", "Rim Nam Village", "rim-nam-village", 25, 35, "town",
        "Village on the western side of the map.",
      ),
      schematicLocation(
        "map-bermuda", "loc-bermuda-mill", "Mill", "mill", 65, 40, "landmark",
        "Windmill landmark in the eastern part of the map.",
      ),
    ],
  },
  {
    id: "map-bermuda-remastered",
    gameId: demoGame.id,
    slug: "bermuda-remastered",
    name: "Bermuda Remastered",
    description:
      "Graphically remastered version of Bermuda with reworked areas and new points of interest. (Summary; pending verification against official sources.)",
    theme: "Tropical island (remastered)",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-peak", "Peak", "peak", 50, 30, "hot_drop",
        "Reworked central high-ground area.",
      ),
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-clock-tower", "Clock Tower", "clock-tower", 42, 45, "hot_drop",
        "Reworked town center.",
      ),
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-factory", "Factory", "factory", 60, 20, "town",
        "Reworked industrial complex.",
      ),
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-nurek-dam", "Nurek Dam", "nurek-dam", 30, 52, "landmark",
        "Dam structure added in the remaster.",
      ),
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-academy", "Academy", "academy", 55, 62, "town",
        "Academy complex added in the remaster.",
      ),
      schematicLocation(
        "map-bermuda-remastered", "loc-bermudarm-riverside", "Riverside", "riverside", 66, 55, "compound",
        "Riverside compound in the east.",
      ),
    ],
  },
  {
    id: "map-purgatory",
    gameId: demoGame.id,
    slug: "purgatory",
    name: "Purgatory",
    description:
      "Island map mixing urban zones, a quarry and highland areas. (Summary; pending verification against official sources.)",
    theme: "Island retreat",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-purgatory", "loc-purgatory-brasilia", "Brasilia", "brasilia", 50, 40, "hot_drop",
        "Central town; historically a popular hot drop.",
        [demoLoot("loot-purgatory-brasilia-1", "loc-purgatory-brasilia", "weapon", "high", "Dense town loot; strong early-game weapons")],
      ),
      schematicLocation(
        "map-purgatory", "loc-purgatory-quarry", "Quarry", "quarry", 30, 55, "landmark",
        "Open-pit quarry in the west.",
      ),
      schematicLocation(
        "map-purgatory", "loc-purgatory-ski-lodge", "Ski Lodge", "ski-lodge", 62, 25, "compound",
        "Lodge compound in the northern highlands.",
      ),
      schematicLocation(
        "map-purgatory", "loc-purgatory-moathouse", "Moathouse", "moathouse", 45, 66, "landmark",
        "Manor-style landmark in the south.",
      ),
      schematicLocation(
        "map-purgatory", "loc-purgatory-central", "Central", "central", 55, 50, "town",
        "Town near the center of the map.",
      ),
      schematicLocation(
        "map-purgatory", "loc-purgatory-lumber-mill", "Lumber Mill", "lumber-mill", 24, 32, "compound",
        "Mill compound in the northwest.",
      ),
    ],
  },
  {
    id: "map-kalahari",
    gameId: demoGame.id,
    slug: "kalahari",
    name: "Kalahari",
    description:
      "Desert map with open terrain, a refinery and scattered compounds. (Summary; pending verification against official sources.)",
    theme: "Desert",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-kalahari", "loc-kalahari-santa-catarina", "Santa Catarina", "santa-catarina", 45, 45, "town",
        "Town near the center of the map.",
      ),
      schematicLocation(
        "map-kalahari", "loc-kalahari-refinery", "Refinery", "refinery", 60, 30, "landmark",
        "Large industrial refinery in the northeast.",
        [demoLoot("loot-kalahari-refinery-1", "loc-kalahari-refinery", "armor", "medium", "Industrial loot with mid-tier armor")],
      ),
      schematicLocation(
        "map-kalahari", "loc-kalahari-the-sub", "The Sub", "the-sub", 35, 60, "landmark",
        "Beached submarine landmark in the southwest.",
      ),
      schematicLocation(
        "map-kalahari", "loc-kalahari-bayfront", "Bayfront", "bayfront", 55, 66, "town",
        "Coastal town in the south.",
      ),
      schematicLocation(
        "map-kalahari", "loc-kalahari-council-hall", "Council Hall", "council-hall", 50, 52, "landmark",
        "Hall complex near the center-south.",
      ),
      schematicLocation(
        "map-kalahari", "loc-kalahari-stone-ridge", "Stone Ridge", "stone-ridge", 25, 40, "compound",
        "Rocky compound in the west.",
      ),
    ],
  },
  {
    id: "map-alpine",
    gameId: demoGame.id,
    slug: "alpine",
    name: "Alpine",
    description:
      "Snow-covered highland map with villages and elevated terrain. (Summary; pending verification against official sources.)",
    theme: "Snowy highlands",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-alpine", "loc-alpine-vantage", "Vantage", "vantage", 50, 35, "hot_drop",
        "Elevated central area; historically contested.",
      ),
      schematicLocation(
        "map-alpine", "loc-alpine-blue-ville", "Blue Ville", "blue-ville", 40, 55, "town",
        "Village in the western lowlands.",
      ),
      schematicLocation(
        "map-alpine", "loc-alpine-snowfall", "Snowfall", "snowfall", 60, 50, "town",
        "Town in the eastern part of the map.",
      ),
      schematicLocation(
        "map-alpine", "loc-alpine-dock", "Dock", "dock", 66, 70, "landmark",
        "Dock area in the southeast.",
      ),
      schematicLocation(
        "map-alpine", "loc-alpine-observatory", "Observatory", "observatory", 45, 25, "landmark",
        "Observatory on the northern heights.",
      ),
      schematicLocation(
        "map-alpine", "loc-alpine-garrison", "Garrison", "garrison", 30, 45, "compound",
        "Military-style compound in the west.",
      ),
    ],
  },
  {
    id: "map-nexterra",
    gameId: demoGame.id,
    slug: "nexterra",
    name: "NeXTerra",
    description:
      "Futuristic map with high-tech facilities and varied districts. (Summary; pending verification against official sources.)",
    theme: "Futuristic",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-nexterra", "loc-nexterra-grav-labs", "Grav Labs", "grav-labs", 50, 40, "landmark",
        "High-tech laboratory complex.",
        [demoLoot("loot-nexterra-gravlabs-1", "loc-nexterra-gravlabs", "special", "high", "High-tech loot spawns around the labs")],
      ),
      schematicLocation(
        "map-nexterra", "loc-nexterra-museum", "Museum", "museum", 45, 55, "landmark",
        "Museum district near the center.",
      ),
      schematicLocation(
        "map-nexterra", "loc-nexterra-farmtopia", "Farmtopia", "farmtopia", 60, 60, "town",
        "Automated farm district in the southeast.",
      ),
      schematicLocation(
        "map-nexterra", "loc-nexterra-deca-square", "Deca Square", "deca-square", 40, 45, "town",
        "Plaza district in the west-center.",
      ),
      schematicLocation(
        "map-nexterra", "loc-nexterra-rust-yard", "Rust Yard", "rust-yard", 55, 30, "compound",
        "Scrapyard compound in the north.",
      ),
      schematicLocation(
        "map-nexterra", "loc-nexterra-plazaria", "Plazaria", "plazaria", 35, 66, "town",
        "Commercial district in the southwest.",
      ),
    ],
  },
  {
    id: "map-solara",
    gameId: demoGame.id,
    slug: "solara",
    name: "Solara",
    description:
      "A port city with a winding coastline, connected by a slide track system that runs throughout the entire map.",
    theme: "Port city",
    imageUrl: null,
    imageCredit: "Schematic illustration — not official map art",
    isDemo: false,
    sourceId: "src-garena-maps",
    verifiedStatus: "VERIFIED",
    verifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    locations: [
      schematicLocation(
        "map-solara", "loc-solara-harbor", "Harbor", "harbor", 40, 60, "landmark",
        "Main harbor district of the port city.",
      ),
      schematicLocation(
        "map-solara", "loc-solara-slide-central", "Slide Central", "slide-central", 50, 45, "landmark",
        "Central hub of the slide track system.",
        [demoLoot("loot-solara-slidecentral-1", "loc-solara-slidecentral", "weapon", "high", "Central hub loot; strong early-game weapons")],
      ),
      schematicLocation(
        "map-solara", "loc-solara-coastline", "Coastline", "coastline", 66, 55, "landmark",
        "Winding coastal stretch in the east.",
      ),
      schematicLocation(
        "map-solara", "loc-solara-old-town", "Old Town", "old-town", 35, 40, "town",
        "Historic town district in the northwest.",
      ),
      schematicLocation(
        "map-solara", "loc-solara-marina", "Marina", "marina", 55, 70, "town",
        "Marina district in the south.",
      ),
      schematicLocation(
        "map-solara", "loc-solara-depot", "Depot", "depot", 60, 35, "compound",
        "Storage depot compound in the northeast.",
      ),
    ],
  },
];

export type CharacterWithAbilities = Character & {
  abilities: CharacterAbility[];
};

function unverifiedCharacter(
  id: string,
  slug: string,
  name: string,
  role: string,
  description: string,
  abilities: { id: string; name: string; type: string; description: string }[],
): CharacterWithAbilities {
  return {
    id,
    gameId: demoGame.id,
    slug,
    name,
    role,
    description: `${description} (Community knowledge — not verified against official sources.)`,
    imageUrl: null,
    isDemo: true,
    sourceId: "src-community-wiki",
    verifiedStatus: "UNVERIFIED",
    verifiedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    abilities: abilities.map((a) => ({
      id: a.id,
      characterId: id,
      name: a.name,
      type: a.type,
      description: `${a.description} (Community knowledge — unverified.)`,
      gameVersionId: null,
      isDemo: true,
      createdAt: NOW,
      updatedAt: NOW,
    })),
  };
}

export const demoCharacters: CharacterWithAbilities[] = [
  unverifiedCharacter(
    "char-alok",
    "alok",
    "Alok",
    "Support",
    "Popular character known for his healing aura and movement-speed boost.",
    [
      {
        id: "abl-alok-drop-the-beat",
        name: "Drop the Beat",
        type: "active",
        description:
          "Creates an aura that restores HP over time and increases movement speed for nearby allies.",
      },
    ],
  ),
  unverifiedCharacter(
    "char-chrono",
    "chrono",
    "Chrono",
    "Defense",
    "Time-manipulating character with a protective force field.",
    [
      {
        id: "abl-chrono-time-turner",
        name: "Time Turner",
        type: "active",
        description:
          "Deploys a force field that blocks incoming damage for a short duration.",
      },
    ],
  ),
  unverifiedCharacter(
    "char-k",
    "k",
    "K",
    "Support",
    "Jiu-jitsu practitioner with switchable combat modes.",
    [
      {
        id: "abl-k-master-of-all",
        name: "Master of All",
        type: "active",
        description:
          "Switches between Jiu-jitsu mode, which restores EP, and Psychology mode, which boosts EP-to-HP conversion.",
      },
    ],
  ),
];

function verifiedTeam(
  id: string,
  slug: string,
  name: string,
  region: string,
  country: string,
  description: string,
  sourceId: string,
): Team {
  return {
    id,
    gameId: demoGame.id,
    slug,
    name,
    region,
    country,
    logoUrl: null,
    description,
    websiteUrl: null,
    isDemo: false,
    sourceId,
    verifiedStatus: "VERIFIED",
    verifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const demoTeams: Team[] = [
  verifiedTeam(
    "team-straw-hats",
    "straw-hats-esports",
    "Straw Hats Esports",
    "Bangladesh",
    "Bangladesh",
    "Winners of FFWS 2026 Bangladesh Spring — 151 points, 2 Booyahs and 94 eliminations in the Grand Finals.",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-titan",
    "titan-esports-club",
    "Titan Esports Club",
    "Bangladesh",
    "Bangladesh",
    "Runners-up of FFWS 2026 Bangladesh Spring — topped the Grand Finals overall standings with 168 points.",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-bangla-unity",
    "bangla-unity",
    "Bangla Unity",
    "Bangladesh",
    "Bangladesh",
    "3rd place at FFWS 2026 Bangladesh Spring (141 points).",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-flame",
    "flame-esports",
    "Flame Esports",
    "Bangladesh",
    "Bangladesh",
    "4th place at FFWS 2026 Bangladesh Spring (125 points).",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-extreme-ex",
    "extreme-ex",
    "Extreme Ex",
    "Bangladesh",
    "Bangladesh",
    "5th place at FFWS 2026 Bangladesh Spring (103 points, 3 Booyahs).",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-team-electro",
    "team-electro",
    "Team Electro",
    "Bangladesh",
    "Bangladesh",
    "6th place at FFWS 2026 Bangladesh Spring (98 points).",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTeam(
    "team-infinity",
    "team-infinity",
    "Team Infinity",
    "Bangladesh",
    "Bangladesh",
    "Champions of FFWS 2026 Bangladesh Fall — 165 points and 3 Booyahs in the Grand Finals; qualified for the FFWS 2026 Global Finals.",
    "src-sportskeeda-bd-fall",
  ),
  verifiedTeam(
    "team-pirate",
    "pirate-esports",
    "Pirate Esports",
    "Bangladesh",
    "Bangladesh",
    "Runners-up of FFWS 2026 Bangladesh Fall — 155 points and 1 Booyah; qualified for the FFWS 2026 Global Finals.",
    "src-sportskeeda-bd-fall",
  ),
  verifiedTeam(
    "team-bigetron",
    "bigetron-by-vitality",
    "Bigetron by Vitality",
    "Southeast Asia",
    "Indonesia",
    "Champions of FFWS 2026 SEA Fall ($100,000) — 135 points and 2 Booyahs in the Grand Finals; qualified for the FFWS 2026 Global Finals.",
    "src-sportskeeda-sea-fall",
  ),
  verifiedTeam(
    "team-buriram",
    "buriram-united-esports",
    "Buriram United Esports",
    "Southeast Asia",
    "Thailand",
    "Champions of FFWS 2026 SEA Spring (371 points).",
    "src-liquipedia-sea-2026-spring",
  ),
  verifiedTeam(
    "team-dp-dominators",
    "dp-dominators",
    "DP Dominators",
    "Pakistan",
    "Pakistan",
    "Champions of FFWS 2026 Pakistan Spring (303 points).",
    "src-liquipedia-pk-2026",
  ),
  verifiedTeam(
    "team-mia-corp",
    "mia-corp",
    "MiA Corp",
    "North America",
    "United States",
    "Champions of FFWS 2026 USA Spring ($10,000) — 107 points, 2 Booyahs and 61 eliminations in the Grand Finals.",
    "src-sportskeeda-usa-spring",
  ),
];

export const demoPlayers: Player[] = [
  {
    id: "player-kojaa",
    gameId: demoGame.id,
    teamId: "team-bigetron",
    ign: "Kojaa",
    realName: null,
    role: null,
    country: "Indonesia",
    description:
      "Bigetron by Vitality player; named Grand Finals MVP of FFWS 2026 SEA Fall ($4,000 MVP prize).",
    isDemo: false,
    sourceId: "src-sportskeeda-sea-fall",
    verifiedStatus: "VERIFIED",
    verifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

function verifiedTournament(
  id: string,
  slug: string,
  name: string,
  region: string,
  format: string | null,
  status: Tournament["status"],
  prizePool: string | null,
  startDate: Date | null,
  endDate: Date | null,
  description: string,
  sourceId: string,
): Tournament {
  return {
    id,
    gameId: demoGame.id,
    slug,
    name,
    region,
    organizer: "Garena",
    format,
    startDate,
    endDate,
    prizePool,
    status,
    officialUrl: null,
    streamUrl: null,
    description,
    isDemo: false,
    sourceId,
    verifiedStatus: "VERIFIED",
    verifiedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export const demoTournaments: Tournament[] = [
  verifiedTournament(
    "trn-ffws-2026-bd-spring",
    "ffws-2026-bangladesh-spring",
    "Free Fire World Series 2026 — Bangladesh Spring",
    "Bangladesh",
    "Champion Rush (Grand Finals)",
    "COMPLETED",
    "Champion: $16,289 — Straw Hats Esports",
    null,
    null,
    "Straw Hats Esports won the Grand Finals with 151 points, two Booyahs and 94 eliminations. Titan Esports Club topped the overall standings (168 points) but finished runner-up after failing to secure a Booyah past the Champion Rush Point.",
    "src-sportskeeda-bd-spring",
  ),
  verifiedTournament(
    "trn-ffws-2026-bd-fall",
    "ffws-2026-bangladesh-fall",
    "Free Fire World Series 2026 — Bangladesh Fall",
    "Bangladesh",
    "Grand Finals (8 matches)",
    "COMPLETED",
    "Champion: $16,275 — Team Infinity",
    null,
    new Date("2026-09-05"),
    "Grand Finals held September 5, 2026. Team Infinity won with 165 points and 3 Booyahs; Pirate Esports finished second with 155 points and 1 Booyah. The top two teams qualified for the FFWS 2026 Global Finals in Thailand (November 2026).",
    "src-sportskeeda-bd-fall",
  ),
  verifiedTournament(
    "trn-ffws-2026-sea-fall",
    "ffws-2026-sea-fall",
    "Free Fire World Series 2026 — SEA Fall",
    "Southeast Asia",
    "Champion Rush Point (110)",
    "COMPLETED",
    "Champion: $100,000 — Bigetron by Vitality",
    null,
    new Date("2026-09-20"),
    "Concluded September 20, 2026. Bigetron by Vitality crossed the Champion Rush Point (110) in match 11 and secured the title with a Booyah in match 13 (135 points, 2 Booyahs). Kojaa named Grand Finals MVP. The top eight teams qualified for the FFWS 2026 Global Finals.",
    "src-sportskeeda-sea-fall",
  ),
  verifiedTournament(
    "trn-ffws-2026-usa-spring",
    "ffws-2026-usa-spring",
    "Free Fire World Series 2026 — USA Spring",
    "North America",
    "Grand Finals",
    "COMPLETED",
    "$30,000 total (Champion: $10,000 — MiA Corp)",
    null,
    null,
    "MiA Corp won the Grand Finals with 107 points, two Booyahs and 61 eliminations. The top six teams qualified for FFWS 2026 USA Summer.",
    "src-sportskeeda-usa-spring",
  ),
  verifiedTournament(
    "trn-ffws-2026-pk-spring",
    "ffws-2026-pakistan-spring",
    "Free Fire World Series 2026 — Pakistan Spring",
    "Pakistan",
    null,
    "COMPLETED",
    null,
    null,
    null,
    "DP Dominators won with 303 points, ahead of Hotshot Esports (280) and Argon Esports (264).",
    "src-liquipedia-pk-2026",
  ),
  verifiedTournament(
    "trn-ffws-2026-sea-spring",
    "ffws-2026-sea-spring",
    "Free Fire World Series 2026 — SEA Spring",
    "Southeast Asia",
    null,
    "COMPLETED",
    null,
    null,
    null,
    "Buriram United Esports won with 371 points, ahead of RRQ Kazu (356) and All Gamers Global (354).",
    "src-liquipedia-sea-2026-spring",
  ),
  verifiedTournament(
    "trn-ffws-2026-global-finals",
    "ffws-2026-global-finals",
    "Free Fire World Series 2026 — Global Finals",
    "International",
    null,
    "UPCOMING",
    null,
    null,
    null,
    "Scheduled for November 2026 in Thailand. Qualified teams include Team Infinity and Pirate Esports (Bangladesh) and Bigetron by Vitality (SEA), plus other regional qualifiers.",
    "src-sportskeeda-bd-fall",
  ),
];

export const demoMatches: Match[] = [];
