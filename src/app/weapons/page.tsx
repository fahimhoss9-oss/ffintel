import Link from "next/link";
import type { Metadata } from "next";
import { getWeapons } from "@/lib/data";
import { Card, SectionTitle, StatusBadge, EmptyState } from "@/components/ui";
import { sortCategories } from "./weapon-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weapons",
  description:
    "Free Fire weapon database — browse by category with sourced stats and verification status. Independent fan project.",
};

export default async function WeaponsPage(props: PageProps<"/weapons">) {
  const searchParams = await props.searchParams;
  const category = typeof searchParams.category === "string" ? searchParams.category : "";
  const q = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  const weapons = await getWeapons();
  const categories = sortCategories([...new Set(weapons.map((w) => w.category))]);

  const hrefFor = (c: string) => {
    const p = new URLSearchParams();
    if (c) p.set("category", c);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/weapons?${s}` : "/weapons";
  };

  const filtered = weapons.filter(
    (w) =>
      (!category || w.category === category) &&
      (!q || w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q)),
  );

  const groups = categories
    .filter((c) => !category || c === category)
    .map((c) => ({ category: c, items: filtered.filter((w) => w.category === c) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <SectionTitle
        title="Weapons"
        subtitle="Browse the weapon roster by category. Stats are shown only when sourced and verified."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="get" action="/weapons" className="w-full sm:max-w-xs">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            name="q"
            defaultValue={typeof searchParams.q === "string" ? searchParams.q : ""}
            placeholder="Search weapons…"
            className="w-full rounded-lg bg-arena-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-arena-700 placeholder:text-zinc-500 focus:outline-none focus:ring-accent-500"
          />
        </form>
        <Link
          href="/compare"
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2 text-center text-sm font-bold text-arena-950 transition hover:bg-accent-400"
        >
          Compare weapons
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href={hrefFor("")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
            !category
              ? "bg-accent-500/15 text-accent-400 ring-accent-500/40"
              : "bg-arena-800 text-zinc-400 ring-arena-700 hover:text-zinc-200"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={hrefFor(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
              category === c
                ? "bg-accent-500/15 text-accent-400 ring-accent-500/40"
                : "bg-arena-800 text-zinc-400 ring-arena-700 hover:text-zinc-200"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No weapons found"
          hint="Try a different search or category. New weapons are added as verified data becomes available."
        />
      ) : (
        groups.map((g) => (
          <section key={g.category} className="mb-10">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">
              {g.category}
              <span className="ml-2 font-normal text-zinc-600">{g.items.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((w) => (
                <Link key={w.id} href={`/weapons/${w.slug}`} className="block">
                  <Card className="h-full p-4 transition hover:ring-accent-500/50">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-zinc-100">{w.name}</h3>
                      <StatusBadge status={w.verifiedStatus} isDemo={w.isDemo} />
                    </div>
                    <p className="mt-1 text-xs font-medium text-zinc-500">{w.category}</p>
                    {w.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{w.description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
