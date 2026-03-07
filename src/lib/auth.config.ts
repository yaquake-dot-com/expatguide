import type { NextAuthConfig } from "next-auth"

// Edge-safe config (no adapter, no node-only imports)
// Used in middleware for session checks
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")

      if (isAdminRoute) {
        return isLoggedIn
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nickname = user.nickname
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.nickname = (token.nickname as string) || null
      }
      return session
    },
  },
  providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
