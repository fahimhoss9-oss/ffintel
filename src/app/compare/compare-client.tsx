"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WeaponWithStats } from "@/data/demo";
import { calculateDPS, calculateTTK } from "@/lib/calculators";
import { Card, StatusBadge, EmptyState, CalculatedNote } from "@/components/ui";
import { calcInputs, currentStat } from "../weapons/weapon-utils";

const TARGET_HP = 200;
const MAX_SELECT = 4;

interface Metric {
  key: string;
  label: string;
  calculated?: boolean;
  better: "higher" | "lower";
  get: (w: WeaponWithStats) => number | null;
  format: (n: number) => string;
}

function tryCalc(w: WeaponWithStats, fn: (i: NonNullable<ReturnType<typeof calcInputs>>) => number): number | null {
  const i = calcInputs(w);
  if (!i) return null;
  try {
    return fn(i);
  } catch {
    return null;
  }
}

const METRICS: Metric[] = [
  {
    key: "damage",
    label: "Body damage / shot",
    better: "higher",
    get: (w) => calcInputs(w)?.damagePerShot ?? null,
    format: (n) => `${n}`,
  },
  {
    key: "fireRate",
    label: "Fire rate",
    better: "higher",
    get: (w) => currentStat(w)?.fireRate ?? null,
    format: (n) => `${n} rpm`,
  },
  {
    key: "magazine",
    label: "Magazine",
    better: "higher",
    get: (w) => currentStat(w)?.magazine ?? null,
    format: (n) => `${n} rounds`,
  },
  {
    key: "reload",
    label: "Reload time",
    better: "lower",
    get: (w) => currentStat(w)?.reloadTime ?? null,
    format: (n) => `${n}s`,
  },
  {
    key: "range",
    label: "Effective range",
    better: "higher",
    get: (w) => currentStat(w)?.range ?? null,
    format: (n) => `${n}m`,
  },
  {
    key: "burstDps",
    label: "Burst DPS",
    calculated: true,
    better: "higher",
    get: (w) => tryCalc(w, (i) => calculateDPS(i).burstDps),
    format: (n) => n.toFixed(1),
  },
  {
    key: "sustainedDps",
    label: "Sustained DPS",
    calculated: true,
    better: "higher",
    get: (w) => tryCalc(w, (i) => calculateDPS(i).sustainedDps),
    format: (n) => n.toFixed(1),
  },
  {
    key: "ttk",
    label: `TTK vs ${TARGET_HP} HP`,
    calculated: true,
    better: "lower",
    get: (w) => tryCalc(w, (i) => calculateTTK({ ...i, targetHealth: TARGET_HP }).ttkSeconds),
    format: (n) => `${n.toFixed(2)}s`,
  },
];

export function CompareClient({
  weapons,
  initialSlugs,
}: {
  weapons: WeaponWithStats[];
  initialSlugs: string[];
}) {
  const valid = useMemo(() => new Set(weapons.map((w) => w.slug)), [weapons]);
  const [selected, setSelected] = useState<string[]>(
    initialSlugs.filter((s) => valid.has(s)).slice(0, MAX_SELECT),
  );

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= MAX_SELECT
          ? prev
          : [...prev, slug],
    );
  };

  const picked = useMemo(
    () => selected.map((s) => weapons.find((w) => w.slug === s)).filter((w) => w != null),
    [selected, weapons],
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {selected.length} of {MAX_SELECT} selected
        </p>
        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {weapons.map((w) => {
          const on = selected.includes(w.slug);
          const disabled = !on && selected.length >= MAX_SELECT;
          return (
            <button
              key={w.id}
              onClick={() => toggle(w.slug)}
              disabled={disabled}
              className={`rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition ${
                on
                  ? "bg-accent-500/10 ring-accent-500/60"
                  : "bg-arena-900 ring-arena-700/60 hover:ring-arena-600"
              } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
              <span className={`block text-sm font-semibold ${on ? "text-accent-400" : "text-zinc-200"}`}>
                {w.name}
              </span>
              <span className="block text-xs text-zinc-500">{w.category}</span>
            </button>
          );
        })}
      </div>

      {picked.length < 2 ? (
        <EmptyState
          title="Select at least 2 weapons"
          hint="Tap weapons above to add them to the comparison table."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-arena-700/60">
                  <th className="sticky left-0 z-10 bg-arena-900 px-3 py-3 text-left text-xs font-medium text-zinc-500">
                    Metric
                  </th>
                  {picked.map((w) => (
                    <th key={w.id} className="min-w-[120px] px-3 py-3 text-center">
                      <Link href={`/weapons/${w.slug}`} className="hover:text-accent-400">
                        <span className="block font-bold text-zinc-100">{w.name}</span>
                      </Link>
                      <span className="mt-1 flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-normal text-zinc-500">{w.category}</span>
                        <StatusBadge status={currentStat(w)?.verifiedStatus} isDemo={w.isDemo} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m) => {
                  const values = picked.map((w) => m.get(w));
                  const nums = values.filter((v): v is number => v != null);
                  const best =
                    nums.length > 0
                      ? m.better === "higher"
                        ? Math.max(...nums)
                        : Math.min(...nums)
                      : null;
                  return (
                    <tr key={m.key} className="border-b border-arena-700/40 last:border-0">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-arena-900 px-3 py-2.5 text-left text-xs font-medium text-zinc-400"
                      >
                        {m.label}
                        {m.calculated && (
                          <span className="ml-1.5 rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-inset ring-purple-500/30">
                            calc
                          </span>
                        )}
                      </th>
                      {picked.map((w, i) => {
                        const v = values[i];
                        const isBest = v != null && best != null && v === best && nums.length > 1;
                        return (
                          <td
                            key={w.id}
                            className={`px-3 py-2.5 text-center ${
                              isBest
                                ? "bg-accent-500/10 font-bold text-accent-400"
                                : v == null
                                  ? "text-zinc-600"
                                  : "text-zinc-200"
                            }`}
                          >
                            {v == null ? "—" : m.format(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-arena-700/60 px-4 py-3">
            <CalculatedNote
              assumptions={[
                `TTK calculated vs a ${TARGET_HP} HP target, body shots, no armor`,
                "DPS values are derived from weapon stats — not official game figures",
                "Best-in-column highlights only compare weapons that have data for that metric",
                "Missing values (—) mean no verified stat is available yet",
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
