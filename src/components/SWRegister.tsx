"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (enables install prompt + offline cache). */
export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is best-effort */
      });
    }
  }, []);
  return null;
}
