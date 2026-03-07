"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
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
      <h2 className="mb-2 text-2xl font-bold font-heading">Что-то пошло не так</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу.
      </p>
      <Button onClick={reset}>Попробовать снова</Button>
    </div>
  )
}
