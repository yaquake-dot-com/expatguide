import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { db } from "@/lib/db"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch fresh user data (nickname may not be in JWT yet)
  const [pendingCount, dbUser] = await Promise.all([
    session.user.role === "SUPER_ADMIN"
      ? db.pendingChange.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { nickname: true },
    }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <AdminSidebar
          role={session.user.role}
          pendingCount={pendingCount}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          userName={session.user.name || session.user.email || "Админ"}
          nickname={dbUser?.nickname || session.user.nickname}
          role={session.user.role}
          pendingCount={pendingCount}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  )
}
