"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CountryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="mb-2 text-2xl font-bold font-heading">Ошибка загрузки</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        Не удалось загрузить данные. Попробуйте обновить страницу или вернитесь на главную.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Обновить</Button>
        <Button variant="outline" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  )
}
