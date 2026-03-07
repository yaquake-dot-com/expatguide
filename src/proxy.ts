import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import { COUNTRY_COOKIE_NAME, COUNTRY_COOKIE_MAX_AGE } from "@/lib/constants"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
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
      // Dev fallback: check custom header
      req.headers.get("x-dev-country")

    if (countryCode) {
      // Map country codes to slugs (no DB call in middleware)
      const countrySlugMap: Record<string, string> = {
        US: "usa",
        DE: "germany",
        TH: "thailand",
      }

      const slug = countrySlugMap[countryCode.toUpperCase()]
      if (slug) {
        const response = NextResponse.redirect(new URL(`/${slug}`, nextUrl))
        response.cookies.set(COUNTRY_COOKIE_NAME, slug, {
          maxAge: COUNTRY_COOKIE_MAX_AGE,
          path: "/",
        })
        return response
      }
    }

    // No country detected — redirect to default
    const response = NextResponse.redirect(new URL("/usa", nextUrl))
    response.cookies.set(COUNTRY_COOKIE_NAME, "usa", {
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
