"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SITE_NAME } from "@/lib/constants"
import { KeyRound, Mail, Loader2 } from "lucide-react"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  const error = searchParams.get("error")

  const [mode, setMode] = useState<"credentials" | "magic-link">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    error === "CredentialsSignin" ? "Неверный email или пароль" : ""
  )

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setErrorMessage("Неверный email или пароль")
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    const result = await signIn("nodemailer", {
      email,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setErrorMessage("Ошибка отправки ссылки. Проверьте email.")
      setLoading(false)
    } else {
      setMagicLinkSent(true)
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-heading">Проверьте почту</CardTitle>
            <CardDescription>
              Ссылка для входа отправлена на {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMagicLinkSent(false)
                setMode("credentials")
              }}
            >
              Вернуться к входу
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">{SITE_NAME}</CardTitle>
          <CardDescription>Панель управления</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {mode === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@expatguide.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Войти
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="admin@expatguide.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Отправить ссылку
              </Button>
            </form>
          )}

          <div className="mt-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">или</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              setMode(mode === "credentials" ? "magic-link" : "credentials")
              setErrorMessage("")
            }}
          >
            {mode === "credentials" ? (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Войти по ссылке из письма
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Войти по паролю
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
