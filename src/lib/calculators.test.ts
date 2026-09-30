import { describe, expect, it } from "vitest";
import { analyzeWeapon, calculateDPS, calculateTTK, effectiveDamage } from "./calculators";

describe("calculateTTK", () => {
  it("computes TTK without reload", () => {
    // 50 dmg/shot, 600 rpm (0.1s between shots), 200 HP -> 4 shots, 0.3s
    const r = calculateTTK({ damagePerShot: 50, fireRate: 600, magazine: 30, targetHealth: 200 });
    expect(r.shotsToKill).toBe(4);
    expect(r.reloads).toBe(0);
    expect(r.ttkSeconds).toBeCloseTo(0.3, 3);
  });

  it("includes reload time when the magazine empties mid-kill", () => {
    // 10 dmg/shot vs 200 HP = 20 shots; mag 12 -> 1 reload after shot 12
    const r = calculateTTK({
      damagePerShot: 10,
      fireRate: 600, // 0.1s interval
      magazine: 12,
      reloadTime: 2,
      targetHealth: 200,
    });
    expect(r.shotsToKill).toBe(20);
    expect(r.reloads).toBe(1);
    // 19 intervals * 0.1 + 1 * 2.0 = 3.9
    expect(r.ttkSeconds).toBeCloseTo(3.9, 3);
  });

  it("never reloads after the killing shot", () => {
    // Exactly 12 shots to kill with a 12-round mag -> 0 reloads
    const r = calculateTTK({
      damagePerShot: 10,
      fireRate: 600,
      magazine: 12,
      reloadTime: 2,
      targetHealth: 120,
    });
    expect(r.shotsToKill).toBe(12);
    expect(r.reloads).toBe(0);
  });

  it("handles multiple reloads", () => {
    // 40 shots needed, mag 10 -> reloads after shots 10, 20, 30 = 3 reloads
    const r = calculateTTK({
      damagePerShot: 5,
      fireRate: 300, // 0.2s interval
      magazine: 10,
      reloadTime: 1.5,
      targetHealth: 200,
    });
    expect(r.shotsToKill).toBe(40);
    expect(r.reloads).toBe(3);
    expect(r.ttkSeconds).toBeCloseTo(39 * 0.2 + 3 * 1.5, 3);
  });

  it("rejects invalid inputs", () => {
    expect(() => calculateTTK({ damagePerShot: 0, fireRate: 600, magazine: 30, targetHealth: 200 })).toThrow();
    expect(() => calculateTTK({ damagePerShot: 50, fireRate: 0, magazine: 30, targetHealth: 200 })).toThrow();
    expect(() => calculateTTK({ damagePerShot: 50, fireRate: 600, magazine: 0, targetHealth: 200 })).toThrow();
  });

  it("rounds up partial shots (overkill accounted)", () => {
    const r = calculateTTK({ damagePerShot: 60, fireRate: 600, magazine: 30, targetHealth: 200 });
    expect(r.shotsToKill).toBe(4); // 3.34 -> 4
    expect(r.totalDamage).toBe(240);
  });
});

describe("calculateDPS", () => {
  it("computes burst and sustained DPS", () => {
    // 50 dmg, 600rpm -> 500 burst DPS; mag 30 + 2s reload:
    // sustained = 1500 / (3 + 2) = 300
    const r = calculateDPS({ damagePerShot: 50, fireRate: 600, magazine: 30, reloadTime: 2 });
    expect(r.burstDps).toBeCloseTo(500, 3);
    expect(r.sustainedDps).toBeCloseTo(300, 3);
  });

  it("sustained equals burst when reload is instant", () => {
    const r = calculateDPS({ damagePerShot: 50, fireRate: 600, magazine: 30, reloadTime: 0 });
    expect(r.sustainedDps).toBeCloseTo(r.burstDps, 6);
  });
});

describe("effectiveDamage", () => {
  it("applies headshot and armor multipliers", () => {
    expect(effectiveDamage(50, { hitLocation: "head", headshotMultiplier: 2 })).toBe(100);
    expect(effectiveDamage(50, { hitLocation: "body", armorMultiplier: 0.8 })).toBe(40);
    expect(
      effectiveDamage(50, { hitLocation: "head", headshotMultiplier: 2, armorMultiplier: 0.8 }),
    ).toBe(80);
  });
});

describe("analyzeWeapon", () => {
  it("returns both TTK and DPS", () => {
    const a = analyzeWeapon({ damagePerShot: 50, fireRate: 600, magazine: 30, reloadTime: 2 }, 200);
    expect(a.ttk.shotsToKill).toBe(4);
    expect(a.dps.burstDps).toBeCloseTo(500, 3);
  });
});
