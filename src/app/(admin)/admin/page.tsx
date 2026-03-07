import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Globe, Users, FileText, Link2, Building2, Megaphone, ShieldCheck } from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()

  const [
    countriesCount,
    citiesCount,
    specialistsCount,
    articlesCount,
    linksCount,
    adsCount,
    pendingCount,
  ] = await Promise.all([
    db.country.count({ where: { isActive: true } }),
    db.city.count(),
    db.specialist.count({ where: { isActive: true } }),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.usefulLink.count({ where: { isActive: true } }),
    db.advertisement.count({ where: { isActive: true } }),
    db.pendingChange.count({ where: { status: "PENDING" } }),
  ])

  const stats = [
    { title: "Страны", value: countriesCount, icon: Globe, href: "/admin/countries" },
    { title: "Города", value: citiesCount, icon: Building2, href: "/admin/cities" },
    { title: "Специалисты", value: specialistsCount, icon: Users, href: "/admin/specialists" },
    { title: "Статьи", value: articlesCount, icon: FileText, href: "/admin/articles" },
    { title: "Ссылки", value: linksCount, icon: Link2, href: "/admin/links" },
    { title: "Реклама", value: adsCount, icon: Megaphone, href: "/admin/ads" },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold font-heading">
        Добро пожаловать, {session?.user?.name || "Админ"}
      </h1>

      {/* Pending changes alert */}
      {session?.user?.role === "SUPER_ADMIN" && pendingCount > 0 && (
        <Link
          href="/admin/moderation"
          className="mb-6 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 transition-colors hover:bg-warning/10"
        >
          <ShieldCheck className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium">Ожидают модерации: {pendingCount}</p>
            <p className="text-sm text-muted-foreground">
              Нажмите, чтобы просмотреть и одобрить изменения
            </p>
          </div>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
