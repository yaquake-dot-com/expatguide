import { db } from "@/lib/db"
import { NextResponse } from "next/server"

// Returns { "NZ": "new-zealand", "US": "usa", ... }
// Cached by Next.js for 1 hour
export const revalidate = 3600

export async function GET() {
  const countries = await db.country.findMany({
    where: { isActive: true },
    select: { code: true, slug: true },
  })

  const map: Record<string, string> = {}
  for (const c of countries) {
    if (c.code) map[c.code.toUpperCase()] = c.slug
  }

  return NextResponse.json(map, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
