"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { createClient } from "@/lib/supabase-client";
import { verifyItem, type ActionResult } from "./actions";

// ---------------------------------------------------------------------------
// Sidebar navigation
// ---------------------------------------------------------------------------

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/weapons", label: "Weapons" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/maps", label: "Maps" },
  { href: "/admin/verify", label: "Verify queue" },
  { href: "/admin/import", label: "Import" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {ADMIN_LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-arena-800 text-zinc-50 ring-1 ring-arena-700"
                : "text-zinc-400 hover:bg-arena-800/60 hover:text-zinc-200"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  return (
    <button
      disabled={working}
      onClick={async () => {
        setWorking(true);
        try {
          await createClient().auth.signOut();
        } catch {
          // ignore — still navigate to login
        }
        router.push("/login");
      }}
      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-400 ring-1 ring-arena-700 hover:text-zinc-200 disabled:opacity-50"
    >
      {working ? "…" : "Sign out"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Form primitives (dark esports styling)
// ---------------------------------------------------------------------------

const inputCls =
  "w-full rounded-lg bg-arena-800 px-3 py-2 text-sm text-zinc-100 ring-1 ring-arena-700 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} rows={props.rows ?? 4} className={`${inputCls} ${props.className ?? ""}`} />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-bold text-arena-950 hover:bg-accent-400 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function CancelLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 ring-1 ring-arena-700 hover:text-zinc-200"
    >
      Cancel
    </Link>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-inset ring-red-500/30">
      {error}
    </p>
  );
}

export function SourceSelect({
  sources,
  defaultValue,
}: {
  sources: { id: string; name: string }[];
  defaultValue?: string | null;
}) {
  return (
    <SelectInput name="sourceId" defaultValue={defaultValue ?? ""}>
      <option value="">— No source —</option>
      {sources.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </SelectInput>
  );
}

export function VerificationSelect({ defaultValue }: { defaultValue?: string | null }) {
  return (
    <SelectInput name="verifiedStatus" defaultValue={defaultValue ?? "UNVERIFIED"}>
      <option value="UNVERIFIED">Unverified</option>
      <option value="VERIFIED">Verified</option>
      <option value="DISPUTED">Disputed</option>
      <option value="OUTDATED">Outdated</option>
    </SelectInput>
  );
}

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

export function DeleteButton({
  id,
  onDelete,
  label = "Delete",
}: {
  id: string;
  onDelete: (id: string) => Promise<ActionResult>;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <button
      disabled={pending}
      onClick={async () => {
        if (!window.confirm("Delete this item? This cannot be undone.")) return;
        setPending(true);
        const res = await onDelete(id);
        setPending(false);
        if (!res.ok) window.alert(res.error ?? "Delete failed.");
      }}
      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/10 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function VerifyButton({
  entityType,
  id,
}: {
  entityType: "weapon" | "tournament" | "team" | "map";
  id: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  if (state === "done") {
    return <span className="text-xs font-semibold text-emerald-300">Verified ✓</span>;
  }
  return (
    <button
      disabled={state === "working"}
      onClick={async () => {
        setState("working");
        const res = await verifyItem(entityType, id);
        setState(res.ok ? "done" : "error");
        if (!res.ok) window.alert(res.error ?? "Verify failed.");
      }}
      className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50"
    >
      {state === "working" ? "…" : state === "error" ? "Retry" : "Verify"}
    </button>
  );
}
