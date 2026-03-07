export const SITE_NAME = "ExpatGuide"
export const SITE_DESCRIPTION = "Портал для русскоязычных экспатов за рубежом"

export const COUNTRY_COOKIE_NAME = "selected_country"
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const ITEMS_PER_PAGE = 12

export const NAV_ITEMS = [
  { label: "Справочник", href: "/directory" },
  { label: "Статьи", href: "/articles" },
  { label: "Полезные ссылки", href: "/links" },
] as const
