import type { WeaponWithStats } from "@/data/demo";

/**
 * The stat row for the current patch, falling back to the newest available.
 * Never invents values — returns null when the weapon has no stat rows.
 */
export function currentStat(w: WeaponWithStats) {
  return w.stats.find((s) => s.gameVersion?.isCurrent) ?? w.stats[0] ?? null;
}

/**
 * Numeric inputs the TTK/DPS engine needs, shaped as the engine expects.
 * Returns null when any required value is missing — callers render "—".
 */
export function calcInputs(w: WeaponWithStats) {
  const s = currentStat(w);
  if (!s) return null;
  const damagePerShot = s.bodyDamage ?? s.damage;
  if (damagePerShot == null || s.fireRate == null || s.magazine == null) return null;
  return {
    damagePerShot,
    fireRate: s.fireRate,
    magazine: s.magazine,
    reloadTime: s.reloadTime ?? 0,
  };
}

/** Preferred display order for weapon categories. Unknown categories sort last. */
const CATEGORY_ORDER = [
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

export function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
