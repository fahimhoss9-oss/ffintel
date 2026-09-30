"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/weapons", label: "Weapons" },
  { href: "/compare", label: "Compare" },
  { href: "/calculators", label: "Calculators" },
  { href: "/maps", label: "Maps" },
  { href: "/esports", label: "Esports" },
  { href: "/search", label: "Search" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-arena-700/60 bg-arena-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 font-black text-arena-950">
            F
          </span>
          <span className="font-bold tracking-tight text-zinc-50">
            FF<span className="text-accent-400">Intel</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-arena-800 text-zinc-50" : "text-zinc-400 hover:bg-arena-800/60 hover:text-zinc-200"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden rounded-lg bg-arena-800 px-3 py-2 text-sm font-medium text-zinc-300 ring-1 ring-arena-700 hover:text-zinc-100 md:block"
          >
            Admin
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-zinc-300 hover:bg-arena-800 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-arena-700/60 px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-arena-800"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-arena-800"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
