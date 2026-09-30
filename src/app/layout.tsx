import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { SWRegister } from "@/components/SWRegister";
import { DemoModeBanner } from "@/components/ui";
import { isDemoMode } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FFIntel — Free Fire Game Intelligence & Esports",
    template: "%s | FFIntel",
  },
  description:
    "Free Fire weapons database, interactive maps, TTK/DPS calculators, tournaments, teams and players. Independent fan project.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FFIntel",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const demo = isDemoMode();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-arena-950 text-zinc-200">
        <SWRegister />
        {demo && <DemoModeBanner />}
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
        <footer className="border-t border-arena-700/60 py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs leading-relaxed text-zinc-500">
            <p className="font-semibold text-zinc-400">
              Independent fan/community project, not affiliated with Garena.
            </p>
            <p className="mt-2">
              All game data is community-sourced and labeled with its source and verification status.
              Statistics marked unverified should be treated as estimates, not official values.
            </p>
            <p className="mt-2">FFIntel · Free Fire is a trademark of Garena.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
