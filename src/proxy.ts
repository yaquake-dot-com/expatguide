import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import { COUNTRY_COOKIE_NAME, COUNTRY_COOKIE_MAX_AGE } from "@/lib/constants"

const { auth } = NextAuth(authConfig)

// Default country when nothing matches
const DEFAULT_COUNTRY = "usa"

async function getCountrySlugMap(baseUrl: string): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${baseUrl}/api/geo`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) return await res.json()
  } catch {
    // API not available
  }
  // Always return empty map instead of fallback — forces redirect to DEFAULT_COUNTRY
  return {}
}

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl))
    }
    return NextResponse.next()
  }

  // Country detection for root path
  if (nextUrl.pathname === "/") {
    // Check cookie first
    const countryCookie = req.cookies.get(COUNTRY_COOKIE_NAME)?.value

    if (countryCookie) {
      return NextResponse.redirect(new URL(`/${countryCookie}`, nextUrl))
    }

    // Try Vercel geolocation header
    const countryCode =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-dev-country")

    if (countryCode) {
      const slugMap = await getCountrySlugMap(nextUrl.origin)
      const slug = slugMap[countryCode.toUpperCase()]

      if (slug) {
        const response = NextResponse.redirect(new URL(`/${slug}`, nextUrl))
        response.cookies.set(COUNTRY_COOKIE_NAME, slug, {
          maxAge: COUNTRY_COOKIE_MAX_AGE,
          path: "/",
        })
        return response
      }
    }

    // No country detected or not in our list — redirect to default
    const response = NextResponse.redirect(new URL(`/${DEFAULT_COUNTRY}`, nextUrl))
    response.cookies.set(COUNTRY_COOKIE_NAME, DEFAULT_COUNTRY, {
      maxAge: COUNTRY_COOKIE_MAX_AGE,
      path: "/",
    })
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads).*)",
  ],
}
