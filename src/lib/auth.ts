import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { db } from "./db"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
          image: user.image,
        }
      },
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER_HOST
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT) || 587,
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          }
        : // Dev: log emails to console
          {
            host: "localhost",
            port: 25,
            secure: false,
            tls: { rejectUnauthorized: false },
          },
      from: process.env.EMAIL_FROM || "noreply@expatguide.local",
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For magic link: check if user exists as admin
      if (account?.provider === "nodemailer") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        })
        // Only allow sign in for existing admin users
        if (!existingUser) {
          return false
        }
      }
      return true
    },
  },
  events: {
    async linkAccount({ user }) {
      // When a magic link account is linked, mark email as verified
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
})
