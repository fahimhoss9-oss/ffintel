import { NextRequest } from "next/server";
import { searchAll } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET /api/search?q=… → { results: [{ type, title, href, subtitle? }] } */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 100) ?? "";
  if (q.trim().length < 2) {
    return Response.json({ results: [] });
  }
  try {
    const results = await searchAll(q);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
