/**
 * TTK (Time To Kill) / DPS (Damage Per Second) calculation engine.
 *
 * IMPORTANT — these are DERIVED values, not official game statistics.
 * Every result must be labeled "calculated" in the UI, alongside the
 * assumptions used. The engine is deliberately fed only by structured
 * weapon records (WeaponStat rows); it never invents numbers.
 *
 * Assumptions (documented, adjustable per call):
 *  - All shots hit the same hit-location (body by default).
 *  - Fire rate is constant (rounds per minute -> seconds between shots).
 *  - The first shot lands at t = 0.
 *  - Reloads happen only when the magazine is empty; each reload costs
 *    `reloadTime` seconds and refills the magazine completely.
 *  - Armor is modeled as a flat damage multiplier (armorMultiplier),
 *    e.g. 0.8 means armor absorbs 20% of damage.
 *  - Range falloff is NOT modeled unless a damageAtRange value is supplied.
 */

export interface TtkInput {
  /** Damage per shot for the chosen hit location (after armor). */
  damagePerShot: number;
  /** Rounds per minute. */
  fireRate: number;
  /** Rounds per magazine. */
  magazine: number;
  /** Seconds per reload. 0 or omitted = no reload modeled. */
  reloadTime?: number;
  /** Enemy health pool. */
  targetHealth: number;
}

export interface TtkResult {
  /** Seconds from first shot to kill. Labeled "calculated" in UI. */
  ttkSeconds: number;
  /** Shots required to kill. */
  shotsToKill: number;
  /** Full reloads performed during the kill. */
  reloads: number;
  /** Damage actually needed (>= targetHealth, accounts for overkill). */
  totalDamage: number;
  /** Echo of assumptions for display. */
  assumptions: string[];
}

export interface DpsInput {
  damagePerShot: number;
  fireRate: number;
  magazine: number;
  reloadTime?: number;
}

export interface DpsResult {
  /** Burst DPS ignoring reloads. */
  burstDps: number;
  /** Sustained DPS across full magazine + reload cycles. */
  sustainedDps: number;
  assumptions: string[];
}

function secondsBetweenShots(fireRate: number): number {
  if (fireRate <= 0) throw new Error("fireRate must be positive");
  return 60 / fireRate;
}

/**
 * Time To Kill in seconds.
 * Formula: (shotsToKill - 1) * interval + reloads * reloadTime
 */
export function calculateTTK(input: TtkInput): TtkResult {
  const { damagePerShot, fireRate, magazine, targetHealth } = input;
  const reloadTime = input.reloadTime ?? 0;

  if (damagePerShot <= 0) throw new Error("damagePerShot must be positive");
  if (magazine <= 0) throw new Error("magazine must be positive");
  if (targetHealth <= 0) throw new Error("targetHealth must be positive");
  if (reloadTime < 0) throw new Error("reloadTime cannot be negative");

  const interval = secondsBetweenShots(fireRate);
  const shotsToKill = Math.ceil(targetHealth / damagePerShot);
  // Reloads needed: every `magazine` shots empties the mag, except we never
  // reload after the killing shot.
  const reloads = Math.floor((shotsToKill - 1) / magazine);
  const ttkSeconds = (shotsToKill - 1) * interval + reloads * reloadTime;

  return {
    ttkSeconds: round3(ttkSeconds),
    shotsToKill,
    reloads,
    totalDamage: round3(shotsToKill * damagePerShot),
    assumptions: [
      `All ${shotsToKill} shots hit for ${damagePerShot} damage each`,
      `Constant fire rate of ${fireRate} rounds/min`,
      reloads > 0
        ? `${reloads} reload(s) of ${reloadTime}s included`
        : "No reload needed",
      "First shot lands at t = 0; no range falloff modeled",
    ],
  };
}

/** Burst DPS (no reload) and sustained DPS (with reload cycles). */
export function calculateDPS(input: DpsInput): DpsResult {
  const { damagePerShot, fireRate, magazine } = input;
  const reloadTime = input.reloadTime ?? 0;

  if (damagePerShot <= 0) throw new Error("damagePerShot must be positive");
  if (magazine <= 0) throw new Error("magazine must be positive");
  if (reloadTime < 0) throw new Error("reloadTime cannot be negative");

  const interval = secondsBetweenShots(fireRate);
  const burstDps = damagePerShot / interval;
  const cycleTime = magazine * interval + reloadTime;
  const sustainedDps = (magazine * damagePerShot) / cycleTime;

  return {
    burstDps: round3(burstDps),
    sustainedDps: round3(sustainedDps),
    assumptions: [
      "Burst DPS ignores reload time",
      `Sustained DPS averages one full magazine (${magazine} rounds) plus a ${reloadTime}s reload`,
      "No missed shots; no range falloff modeled",
    ],
  };
}

/**
 * Apply armor + hit-location to a base body-damage value.
 * Returns effective damage per shot. Pass armorMultiplier = 1 for no armor.
 */
export function effectiveDamage(
  baseBodyDamage: number,
  opts: { hitLocation?: "head" | "body" | "limb"; headshotMultiplier?: number; armorMultiplier?: number } = {},
): number {
  const { hitLocation = "body", headshotMultiplier = 2, armorMultiplier = 1 } = opts;
  if (baseBodyDamage <= 0) throw new Error("baseBodyDamage must be positive");
  const locationMultiplier = hitLocation === "head" ? headshotMultiplier : 1;
  return round3(baseBodyDamage * locationMultiplier * armorMultiplier);
}

/** Convenience: full TTK+DPS workup for one weapon stat record. */
export function analyzeWeapon(
  stat: { damagePerShot: number; fireRate: number; magazine: number; reloadTime?: number },
  targetHealth = 200,
): { ttk: TtkResult; dps: DpsResult } {
  return {
    ttk: calculateTTK({ ...stat, targetHealth }),
    dps: calculateDPS(stat),
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
