import { Role } from "@/generated/prisma"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      nickname: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    nickname?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    nickname?: string | null
  }
}
