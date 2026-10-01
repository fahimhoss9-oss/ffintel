import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSources, getWeapon } from "@/lib/data";
import {
  Card,
  SectionTitle,
  StatRow,
  StatusBadge,
  EmptyState,
  CalculatedNote,
} from "@/components/ui";
import { calculateDPS, calculateTTK, effectiveDamage } from "@/lib/calculators";
import { currentStat, calcInputs } from "../weapon-utils";
import { WeaponIcon } from "@/components/WeaponIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/weapons/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const weapon = await getWeapon(slug);
  if (!weapon) return { title: "Weapon not found" };
  return {
    title: `${weapon.name} — Stats & Details`,
    description:
      weapon.description ??
      `${weapon.name} (${weapon.category}) — Free Fire weapon stats with sources and verification status.`,
  };
}

export default async function WeaponDetailPage(props: PageProps<"/weapons/[slug]">) {
  const { slug } = await props.params;
  const weapon = await getWeapon(slug);
  if (!weapon) notFound();

  const stat = currentStat(weapon);
  const sources = getSources();

  // Only non-null fields are rendered — never invented values.
  const statRows: [string, string][] = [];
  if (stat) {
    if (stat.bodyDamage != null) statRows.push(["Body damage", `${stat.bodyDamage} / shot`]);
    if (stat.headshotDamage != null)
      statRows.push(["Headshot damage", `${stat.headshotDamage} / shot`]);
    if (stat.limbDamage != null) statRows.push(["Limb damage", `${stat.limbDamage} / shot`]);
    if (stat.fireRate != null) statRows.push(["Fire rate", `${stat.fireRate} rpm`]);
    if (stat.magazine != null) statRows.push(["Magazine", `${stat.magazine} rounds`]);
    if (stat.reloadTime != null) statRows.push(["Reload time", `${stat.reloadTime}s`]);
    if (stat.range != null) statRows.push(["Effective range", `${stat.range}m`]);
    if (stat.accuracy != null) statRows.push(["Accuracy", `${stat.accuracy}`]);
    if (stat.armorPenetration != null)
      statRows.push(["Armor penetration", `${stat.armorPenetration}`]);
    if (stat.movementSpeed != null)
      statRows.push(["Movement speed", `${stat.movementSpeed}×`]);
    if (stat.ammoType) statRows.push(["Ammo type", stat.ammoType]);
  }

  // Derived TTK/DPS from verified stats only, clearly labeled as calculated.
  const inputs = calcInputs(weapon);
  let ttk: ReturnType<typeof calculateTTK> | null = null;
  let dps: ReturnType<typeof calculateDPS> | null = null;
  if (inputs) {
    try {
      const dmg = effectiveDamage(inputs.damagePerShot, { hitLocation: "body" });
      ttk = calculateTTK({ ...inputs, damagePerShot: dmg, targetHealth: 200 });
      dps = calculateDPS({ ...inputs, damagePerShot: dmg });
    } catch {
      ttk = null;
      dps = null;
    }
  }

  const sourceIds = [...new Set([weapon.sourceId, ...weapon.stats.map((s) => s.sourceId)].filter(Boolean))] as string[];
  const resolvedSources = sourceIds.map((id) => ({
    id,
    ...(sources.find((s) => s.id === id) ?? {}),
  }));

  const history = [
    ...(stat ? [stat] : []),
    ...weapon.stats.filter((s) => s.id !== stat?.id),
  ];

  return (
    <div>
      <Link href="/weapons" className="mb-4 inline-block text-sm text-zinc-400 hover:text-zinc-200">
        ← All weapons
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <WeaponIcon
          slug={weapon.slug}
          iconUrl={weapon.iconUrl}
          name={weapon.name}
          className="h-16 w-16 shrink-0 text-accent-500"
        />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {weapon.name}
        </h1>
        <span className="rounded-full bg-arena-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-arena-700">
          {weapon.category}
        </span>
        <StatusBadge status={weapon.verifiedStatus} isDemo={weapon.isDemo} />
      </div>

      {weapon.description && <p className="mb-6 max-w-2xl text-sm text-zinc-400">{weapon.description}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={`/compare?weapons=${weapon.slug}`}
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 transition hover:bg-accent-400"
        >
          Compare this weapon
        </Link>
        <Link
          href={`/calculators?weapon=${weapon.slug}`}
          className="rounded-lg bg-arena-800 px-4 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-arena-700 transition hover:ring-accent-500/50"
        >
          Open in TTK calculator
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle
            title="Current patch stats"
            subtitle={
              stat
                ? `Patch ${stat.gameVersion.version}${stat.gameVersion.title ? ` — ${stat.gameVersion.title}` : ""}`
                : undefined
            }
          />
          {stat && (
            <div className="mb-3">
              <StatusBadge status={stat.verifiedStatus} isDemo={stat.isDemo} />
            </div>
          )}
          {!stat || statRows.length === 0 ? (
            <EmptyState
              title="Stats not yet verified"
              hint="No sourced statistics for this weapon on the current patch yet. Values are added only with a citable source — never estimated."
            />
          ) : (
            <dl>
              {statRows.map(([label, value]) => (
                <StatRow key={label} label={label} value={value} />
              ))}
            </dl>
          )}
          {stat?.notes && <p className="mt-3 text-xs text-zinc-500">{stat.notes}</p>}
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Derived performance"
            subtitle="Calculated from the stats above — not official game data."
          />
          {!ttk || !dps ? (
            <EmptyState
              title="Cannot calculate yet"
              hint="TTK and DPS need verified damage, fire rate and magazine values."
            />
          ) : (
            <div>
              <dl>
                <StatRow label="TTK vs 200 HP (body)" value={`${ttk.ttkSeconds.toFixed(2)}s`} />
                <StatRow label="Shots to kill" value={ttk.shotsToKill} />
                <StatRow label="Reloads during kill" value={ttk.reloads} />
                <StatRow label="Burst DPS" value={dps.burstDps.toFixed(1)} />
                <StatRow label="Sustained DPS" value={dps.sustainedDps.toFixed(1)} />
              </dl>
              <CalculatedNote assumptions={[...ttk.assumptions, ...dps.assumptions]} />
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <SectionTitle title="Patch history" subtitle="Stat records are versioned — history is preserved, never overwritten." />
        {history.length === 0 ? (
          <EmptyState title="No stat records yet" />
        ) : (
          <ul className="space-y-3">
            {history.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-arena-850 px-4 py-3 ring-1 ring-arena-700/50"
              >
                <span className="font-semibold text-zinc-100">{s.gameVersion.version}</span>
                {s.gameVersion.isCurrent && (
                  <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-[11px] font-semibold text-accent-400 ring-1 ring-inset ring-accent-500/30">
                    Current
                  </span>
                )}
                <StatusBadge status={s.verifiedStatus} isDemo={s.isDemo} />
                {s.verifiedAt && (
                  <span className="text-xs text-zinc-500">
                    Verified {new Date(s.verifiedAt).toLocaleDateString()}
                  </span>
                )}
                {s.notes && <p className="w-full text-xs text-zinc-500">{s.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4 p-5">
        <SectionTitle title="Sources" subtitle="Where this record's information comes from." />
        {resolvedSources.length === 0 ? (
          <EmptyState title="No sources recorded" />
        ) : (
          <ul className="space-y-2">
            {resolvedSources.map((s) => (
              <li key={s.id} className="text-sm">
                {"url" in s && s.url ? (
                  <a
                    href={s.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-400 hover:text-accent-500 hover:underline"
                  >
                    {s.name ?? s.id}
                  </a>
                ) : (
                  <span className="text-zinc-300">{("name" in s && s.name) || s.id}</span>
                )}
                {"notes" in s && s.notes && (
                  <span className="text-zinc-500"> — {s.notes as string}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
