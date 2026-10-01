"use client";

import { useState } from "react";

/**
 * Original schematic weapon icon (drawn for this app — no Garena artwork).
 * Resolves `/icons/weapons/<slug>.svg`, falling back to a generic crosshair
 * when a weapon has no icon file (e.g. added later via the admin panel).
 */
export function WeaponIcon({
  slug,
  iconUrl,
  name,
  className = "h-12 w-12",
}: {
  slug: string;
  iconUrl?: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed
    ? "/icons/weapons/generic.svg"
    : (iconUrl ?? `/icons/weapons/${slug}.svg`);
  return (
    <img
      src={src}
      alt={`${name} schematic icon`}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
      draggable={false}
    />
  );
}
