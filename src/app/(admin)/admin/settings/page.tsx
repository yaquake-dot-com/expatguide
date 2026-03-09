import { PageHeader } from "@/components/admin/page-header"
import { ThemeSettingsForm } from "@/components/admin/settings/theme-settings-form"
import { getSiteSettings } from "@/actions/settings"

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div>
      <PageHeader title="Настройки сайта" />
      <ThemeSettingsForm
        currentTheme={settings.theme as "default" | "neobrutalism"}
        currentSiteName={settings.siteName}
      />
    </div>
  )
}
