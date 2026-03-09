import type { Metadata } from "next"
import { Inter, Nunito_Sans } from "next/font/google"
import { Providers } from "@/components/providers"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"
import { getTheme } from "@/lib/theme"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
})

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin", "cyrillic"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pereehali.com"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const theme = await getTheme()

  return (
    <html lang="ru" data-theme={theme}>
      <body
        className={`${inter.variable} ${nunitoSans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
