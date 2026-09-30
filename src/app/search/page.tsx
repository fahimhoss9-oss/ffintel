"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type Result = {
  type: string;
  title: string;
  href: string;
  subtitle?: string;
};

const TYPE_STYLES: Record<string, string> = {
  Weapon: "bg-accent-500/15 text-accent-400 ring-accent-500/30",
  Map: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Tournament: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  Team: "bg-purple-500/15 text-purple-300 ring-purple-500/30",
};

const TYPE_ORDER = ["Weapon", "Map", "Tournament", "Team"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setResults([]);
      }
      setLoading(false);
      setSearched(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const groups = TYPE_ORDER.map((type) => ({
    type,
    items: results.filter((r) => r.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">Search</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Search weapons, maps, tournaments and teams.
        </p>
      </div>

      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type at least 2 characters…"
          autoComplete="off"
          className="w-full rounded-xl bg-arena-900 py-3.5 pl-12 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 ring-1 ring-arena-700/60 outline-none focus:ring-2 focus:ring-accent-500/60"
        />
      </div>

      {loading && <p className="text-sm text-zinc-500">Searching…</p>}

      {!loading && searched && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-arena-600 px-6 py-12 text-center">
          <p className="font-semibold text-zinc-300">No results for “{q.trim()}”</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different weapon, map, tournament or team name.</p>
        </div>
      )}

      {!loading && !searched && (
        <p className="text-sm text-zinc-500">
          Results update as you type. Try “M1887”, “Bermuda”, or a team name.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.type}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
            {g.type}s · {g.items.length}
          </h2>
          <div className="overflow-hidden rounded-xl bg-arena-900 ring-1 ring-arena-700/60">
            {g.items.map((r) => (
              <Link
                key={`${r.type}-${r.href}`}
                href={r.href}
                className="flex items-center justify-between gap-3 border-b border-arena-700/50 px-4 py-3 last:border-0 hover:bg-arena-850"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-100">{r.title}</p>
                  {r.subtitle && <p className="truncate text-xs text-zinc-500">{r.subtitle}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    TYPE_STYLES[r.type] ?? "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30"
                  }`}
                >
                  {r.type}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
