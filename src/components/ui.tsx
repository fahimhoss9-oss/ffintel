import type { ReactNode } from "react";

/** Small status pill: VERIFIED (green) / UNVERIFIED (amber) / DEMO (purple). */
export function StatusBadge({
  status,
  isDemo,
}: {
  status?: string | null;
  isDemo?: boolean | null;
}) {
  if (isDemo) {
    return (
      <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-semibold text-purple-300 ring-1 ring-inset ring-purple-500/30">
        DEMO
      </span>
    );
  }
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
        Verified
      </span>
    );
  }
  if (status === "DISPUTED" || status === "OUTDATED") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300 ring-1 ring-inset ring-red-500/30">
        {status === "DISPUTED" ? "Disputed" : "Outdated"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
      Unverified
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-arena-900 ring-1 ring-arena-700/60 ${className}`}>{children}</div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
    </div>
  );
}

export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-arena-700/50 py-2.5 last:border-0">
      <dt className="text-sm text-zinc-400">{label}</dt>
      <dd className="text-sm font-semibold text-zinc-100">{value ?? <span className="font-normal text-zinc-500">—</span>}</dd>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-arena-600 px-6 py-12 text-center">
      <p className="font-semibold text-zinc-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

/** Shown on every page while running without a configured database. */
export function DemoModeBanner() {
  return (
    <div className="border-b border-purple-500/30 bg-purple-950/40 px-4 py-2 text-center text-xs text-purple-200">
      Demo mode — showing sample data. Connect a database in <span className="font-mono">.env</span> for live data.
    </div>
  );
}

export function CalculatedNote({ assumptions }: { assumptions: string[] }) {
  return (
    <details className="mt-3 rounded-lg bg-arena-850 px-4 py-3 text-xs text-zinc-400 ring-1 ring-arena-700/50">
      <summary className="cursor-pointer font-semibold text-zinc-300">
        Calculated value — assumptions
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {assumptions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="mt-2 text-zinc-500">This is a derived estimate, not an official game statistic.</p>
    </details>
  );
}
