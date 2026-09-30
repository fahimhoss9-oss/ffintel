"use client";

import { useState } from "react";
import { importWeapons } from "../actions";
import { Card, SectionTitle } from "@/components/ui";
import { TextArea } from "../shared";

export const dynamic = "force-dynamic";

type CsvRow = { name: string; slug?: string; category?: string; description?: string };

/** Minimal CSV parser supporting quoted fields and escaped quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

function rowsFromCsv(text: string): { rows: CsvRow[]; error?: string } {
  const raw = parseCsv(text);
  if (raw.length === 0) return { rows: [], error: "No rows found." };
  const first = raw[0].map((c) => c.trim().toLowerCase());
  const hasHeader = first[0] === "name";
  const data = hasHeader ? raw.slice(1) : raw;
  const rows: CsvRow[] = data.map((r) => ({
    name: (r[0] ?? "").trim(),
    slug: (r[1] ?? "").trim() || undefined,
    category: (r[2] ?? "").trim() || undefined,
    description: (r[3] ?? "").trim() || undefined,
  }));
  const bad = rows.findIndex((r) => !r.name);
  if (bad >= 0) return { rows: [], error: `Row ${bad + (hasHeader ? 2 : 1)} is missing a name.` };
  if (rows.length === 0) return { rows: [], error: "No data rows found." };
  return { rows };
}

const SAMPLE = `name,slug,category,description
M1887,m1887,Shotgun,"High-damage pump shotgun, deadly at close range."
AK47,ak47,AR,"Reliable assault rifle with strong mid-range damage."`;

export default function ImportPage() {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<CsvRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<
    | { ok: true; created: number; skipped: string[] }
    | { ok: false; error: string }
    | null
  >(null);

  function onPreview() {
    setResult(null);
    const { rows, error } = rowsFromCsv(csv);
    if (error) {
      setParseError(error);
      setPreview(null);
    } else {
      setParseError(null);
      setPreview(rows);
    }
  }

  async function onImport() {
    if (!preview) return;
    setWorking(true);
    setResult(null);
    const res = await importWeapons(preview);
    setWorking(false);
    setResult(res);
    if (res.ok) {
      setPreview(null);
      setCsv("");
    }
  }

  return (
    <div>
      <SectionTitle
        title="Import weapons"
        subtitle="Paste CSV data to bulk-add weapons. Everything imports as UNVERIFIED for review in the verify queue."
      />
      <Card className="p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-300">
              CSV columns: <span className="font-mono text-xs">name, slug, category, description</span>
            </p>
            <p className="mb-2 text-xs text-zinc-500">
              A header row is optional. Slug auto-generates from the name when blank.{" "}
              <button
                type="button"
                onClick={() => setCsv(SAMPLE)}
                className="underline hover:text-zinc-300"
              >
                Load sample
              </button>
            </p>
            <TextArea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={8}
              placeholder={SAMPLE}
              className="font-mono"
            />
          </div>
          {parseError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-inset ring-red-500/30">
              {parseError}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPreview}
              className="rounded-lg bg-arena-800 px-4 py-2 text-sm font-semibold text-zinc-200 ring-1 ring-arena-700 hover:bg-arena-700"
            >
              Preview
            </button>
            {preview && (
              <button
                type="button"
                onClick={onImport}
                disabled={working}
                className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 hover:bg-accent-400 disabled:opacity-50"
              >
                {working ? "Importing…" : `Import ${preview.length} as unverified`}
              </button>
            )}
          </div>
        </div>
      </Card>

      {preview && (
        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-arena-700/60">
                {["Name", "Slug", "Category", "Description"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 50).map((r, i) => (
                <tr key={i} className="border-b border-arena-700/40 last:border-0">
                  <td className="px-4 py-2.5 font-semibold text-zinc-100">{r.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-zinc-500">{r.slug ?? "—"}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{r.category ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-zinc-500">
                    {r.description ? r.description.slice(0, 80) + (r.description.length > 80 ? "…" : "") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 50 && (
            <p className="px-4 py-3 text-xs text-zinc-500">
              Showing first 50 of {preview.length} rows.
            </p>
          )}
        </Card>
      )}

      {result && (
        <div
          className={`mt-4 rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${
            result.ok
              ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/30"
              : "bg-red-500/10 text-red-300 ring-red-500/30"
          }`}
        >
          {result.ok ? (
            <>
              <p className="font-semibold">Imported {result.created} weapon(s) as UNVERIFIED.</p>
              {result.skipped.length > 0 && (
                <p className="mt-1 text-xs opacity-80">
                  Skipped {result.skipped.length} (likely duplicate slugs): {result.skipped.join(", ")}
                </p>
              )}
            </>
          ) : (
            <p className="font-semibold">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
