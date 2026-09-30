"use client";

import { useMemo, useState } from "react";
import type { WeaponWithStats } from "@/data/demo";
import { calculateDPS, calculateTTK, effectiveDamage } from "@/lib/calculators";
import {
  Card,
  SectionTitle,
  StatRow,
  StatusBadge,
  EmptyState,
  CalculatedNote,
} from "@/components/ui";
import { currentStat } from "../weapons/weapon-utils";

type HitLocation = "body" | "head";

function num(v: string): number | null {
  const n = parseFloat(v);
  return v.trim() === "" || Number.isNaN(n) ? null : n;
}

function prefillFrom(w: WeaponWithStats | undefined) {
  const s = w ? currentStat(w) : null;
  return {
    damage: s?.bodyDamage != null ? String(s.bodyDamage) : s?.damage != null ? String(s.damage) : "",
    fireRate: s?.fireRate != null ? String(s.fireRate) : "",
    magazine: s?.magazine != null ? String(s.magazine) : "",
    reloadTime: s?.reloadTime != null ? String(s.reloadTime) : "0",
    stat: s,
  };
}

function NumField({
  label,
  value,
  onChange,
  step = "any",
  min,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-400">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-arena-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-arena-700 placeholder:text-zinc-600 focus:outline-none focus:ring-accent-500"
      />
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

export function CalculatorClient({
  weapons,
  initialWeapon,
}: {
  weapons: WeaponWithStats[];
  initialWeapon: string;
}) {
  const initial = weapons.find((w) => w.slug === initialWeapon);
  const initialPrefill = prefillFrom(initial);

  const [weaponSlug, setWeaponSlug] = useState(initial?.slug ?? "");
  const [damage, setDamage] = useState(initialPrefill.damage);
  const [fireRate, setFireRate] = useState(initialPrefill.fireRate);
  const [magazine, setMagazine] = useState(initialPrefill.magazine);
  const [reloadTime, setReloadTime] = useState(initialPrefill.reloadTime);
  const [targetHp, setTargetHp] = useState("200");
  const [hitLocation, setHitLocation] = useState<HitLocation>("body");
  const [headshotMult, setHeadshotMult] = useState("2");
  const [armorPct, setArmorPct] = useState("100");

  const selectedWeapon = weapons.find((w) => w.slug === weaponSlug);
  const selectedStat = selectedWeapon ? currentStat(selectedWeapon) : null;
  const hasPrefillData = selectedStat != null && (damage !== "" || fireRate !== "" || magazine !== "");

  const selectWeapon = (slug: string) => {
    setWeaponSlug(slug);
    const w = weapons.find((x) => x.slug === slug);
    const p = prefillFrom(w);
    setDamage(p.damage);
    setFireRate(p.fireRate);
    setMagazine(p.magazine);
    setReloadTime(p.reloadTime);
  };

  const result = useMemo(() => {
    const d = num(damage);
    const fr = num(fireRate);
    const mag = num(magazine);
    const rt = num(reloadTime);
    const hp = num(targetHp);
    const hs = num(headshotMult);
    const armor = num(armorPct);

    if (d == null || d <= 0 || fr == null || fr <= 0 || mag == null || mag <= 0 || hp == null || hp <= 0)
      return { error: "Enter a positive damage, fire rate, magazine size and target HP." };
    if (rt == null || rt < 0 || hs == null || hs <= 0 || armor == null || armor <= 0 || armor > 100)
      return { error: "Check reload time, headshot multiplier and armor values." };

    try {
      const eff = effectiveDamage(d, {
        hitLocation,
        headshotMultiplier: hs,
        armorMultiplier: armor / 100,
      });
      const ttk = calculateTTK({ damagePerShot: eff, fireRate: fr, magazine: mag, reloadTime: rt, targetHealth: hp });
      const dps = calculateDPS({ damagePerShot: eff, fireRate: fr, magazine: mag, reloadTime: rt });
      return { ttk, dps, eff };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not calculate." };
    }
  }, [damage, fireRate, magazine, reloadTime, targetHp, hitLocation, headshotMult, armorPct]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <SectionTitle title="Inputs" subtitle="Values are yours to adjust — nothing here is presented as official data." />

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-zinc-400">Weapon preset</span>
          <select
            value={weaponSlug}
            onChange={(e) => selectWeapon(e.target.value)}
            className="w-full rounded-lg bg-arena-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-arena-700 focus:outline-none focus:ring-accent-500"
          >
            <option value="">Custom stats (manual entry)</option>
            {weapons.map((w) => (
              <option key={w.id} value={w.slug}>
                {w.name} ({w.category})
              </option>
            ))}
          </select>
        </label>

        {weaponSlug && (
          <div className="mb-4 rounded-lg bg-arena-850 px-3 py-2.5 ring-1 ring-arena-700/50">
            {selectedStat && hasPrefillData ? (
              <p className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                Prefilled from {selectedWeapon?.name} · patch {selectedStat.gameVersion.version}
                <StatusBadge status={selectedStat.verifiedStatus} isDemo={selectedStat.isDemo} />
              </p>
            ) : (
              <p className="text-xs text-amber-300">
                No verified stats for this weapon yet — enter values manually below.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <NumField label="Damage / shot" value={damage} onChange={setDamage} hint="Body damage from the weapon record" />
          <NumField label="Fire rate (rpm)" value={fireRate} onChange={setFireRate} />
          <NumField label="Magazine (rounds)" value={magazine} onChange={setMagazine} step="1" min="1" />
          <NumField label="Reload time (s)" value={reloadTime} onChange={setReloadTime} min="0" />
          <NumField label="Target HP" value={targetHp} onChange={setTargetHp} step="1" min="1" />
          <NumField label="Headshot multiplier" value={headshotMult} onChange={setHeadshotMult} hint="Applied when hit location is Head" />
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-medium text-zinc-400">Hit location</span>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-arena-800 p-1 ring-1 ring-arena-700">
            {(["body", "head"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setHitLocation(loc)}
                className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                  hitLocation === loc ? "bg-accent-500 text-arena-950" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-400">
            Damage kept through armor
            <span className="font-bold text-zinc-200">{armorPct}%</span>
          </span>
          <input
            type="range"
            min={50}
            max={100}
            value={armorPct}
            onChange={(e) => setArmorPct(e.target.value)}
            className="w-full accent-amber-500"
          />
          <span className="mt-1 block text-[11px] text-zinc-500">
            100% = no armor. A flat multiplier — your assumption, not a game stat.
          </span>
        </label>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Results" subtitle="Calculated estimates based on your inputs." />
        {"error" in result ? (
          <EmptyState title="No result yet" hint={result.error} />
        ) : (
          <div>
            <div className="mb-4 rounded-xl bg-arena-850 px-5 py-4 text-center ring-1 ring-arena-700/50">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time to kill</p>
              <p className="mt-1 text-4xl font-black tracking-tight text-accent-400">
                {result.ttk.ttkSeconds.toFixed(2)}
                <span className="text-lg font-bold">s</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {result.ttk.shotsToKill} shot{result.ttk.shotsToKill === 1 ? "" : "s"} ·{" "}
                {result.eff.toFixed(1)} effective damage / shot
              </p>
            </div>
            <dl>
              <StatRow label="Shots to kill" value={result.ttk.shotsToKill} />
              <StatRow label="Reloads during kill" value={result.ttk.reloads} />
              <StatRow label="Burst DPS" value={result.dps.burstDps.toFixed(1)} />
              <StatRow label="Sustained DPS" value={result.dps.sustainedDps.toFixed(1)} />
            </dl>
            <CalculatedNote
              assumptions={[
                `Target: ${targetHp} HP`,
                `Hit location: ${hitLocation} (headshot multiplier ${headshotMult}×)`,
                `Armor keeps ${armorPct}% of damage — flat multiplier assumption`,
                ...result.ttk.assumptions,
                ...result.dps.assumptions,
              ]}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
