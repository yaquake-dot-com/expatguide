import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <SearchX className="mb-6 h-16 w-16 text-muted-foreground/50" />
      <h1 className="mb-2 text-4xl font-bold font-heading">404</h1>
      <h2 className="mb-4 text-xl text-muted-foreground">
        Страница не найдена
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Страница, которую вы ищете, не существует или была перемещена.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Link>
      </Button>
    </div>
  )
}
