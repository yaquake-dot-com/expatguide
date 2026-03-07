import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { COUNTRY_COOKIE_NAME } from "@/lib/constants"

// Root page: redirect to country page
// Middleware handles geolocation detection,
// but this is a fallback for direct visits
export default async function RootPage() {
  const cookieStore = await cookies()
  const country = cookieStore.get(COUNTRY_COOKIE_NAME)?.value

  if (country) {
    redirect(`/${country}`)
  }

  // Default fallback (middleware should handle this normally)
  redirect("/usa")
}
