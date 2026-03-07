import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Create SuperAdmin user
  const passwordHash = await hash("admin123", 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@expatguide.com" },
    update: {},
    create: {
      email: "admin@expatguide.com",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  })
  console.log(`Created SuperAdmin: ${superAdmin.email}`)

  // Create countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { slug: "usa" },
      update: {},
      create: {
        name: "США",
        nameIn: "в США",
        nameFor: "для США",
        slug: "usa",
        code: "US",
        flag: "🇺🇸",
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.country.upsert({
      where: { slug: "germany" },
      update: {},
      create: {
        name: "Германия",
        nameIn: "в Германии",
        nameFor: "для Германии",
        slug: "germany",
        code: "DE",
        flag: "🇩🇪",
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.country.upsert({
      where: { slug: "thailand" },
      update: {},
      create: {
        name: "Таиланд",
        nameIn: "в Таиланде",
        nameFor: "для Таиланда",
        slug: "thailand",
        code: "TH",
        flag: "🇹🇭",
        isActive: true,
        sortOrder: 3,
      },
    }),
  ])
  console.log(`Created ${countries.length} countries`)

  const usa = countries.find((c) => c.slug === "usa")!
  const germany = countries.find((c) => c.slug === "germany")!
  const thailand = countries.find((c) => c.slug === "thailand")!

  // Create cities
  const citiesData = [
    // USA
    { name: "Нью-Йорк", slug: "new-york", countrySlug: "usa" },
    { name: "Лос-Анджелес", slug: "los-angeles", countrySlug: "usa" },
    { name: "Майами", slug: "miami", countrySlug: "usa" },
    { name: "Чикаго", slug: "chicago", countrySlug: "usa" },
    // Germany
    { name: "Берлин", slug: "berlin", countrySlug: "germany" },
    { name: "Мюнхен", slug: "munich", countrySlug: "germany" },
    { name: "Гамбург", slug: "hamburg", countrySlug: "germany" },
    // Thailand
    { name: "Бангкок", slug: "bangkok", countrySlug: "thailand" },
    { name: "Пхукет", slug: "phuket", countrySlug: "thailand" },
    { name: "Паттайя", slug: "pattaya", countrySlug: "thailand" },
  ]

  const cityRecords: Record<string, { id: string }> = {}
  for (const city of citiesData) {
    const country = countries.find((c) => c.slug === city.countrySlug)!
    const record = await prisma.city.upsert({
      where: {
        countryId_slug: { countryId: country.id, slug: city.slug },
      },
      update: {},
      create: {
        name: city.name,
        slug: city.slug,
        countryId: country.id,
      },
    })
    cityRecords[city.slug] = record
  }
  console.log(`Created ${citiesData.length} cities`)

  // Create specialist categories
  const categories = [
    { name: "Медицина", slug: "medicine", icon: "Stethoscope", sortOrder: 1 },
    { name: "Юридические услуги", slug: "legal", icon: "Scale", sortOrder: 2 },
    { name: "Ремонт и строительство", slug: "construction", icon: "Hammer", sortOrder: 3 },
    { name: "Авто", slug: "auto", icon: "Car", sortOrder: 4 },
    { name: "Красота и здоровье", slug: "beauty", icon: "Sparkles", sortOrder: 5 },
    { name: "Образование", slug: "education", icon: "GraduationCap", sortOrder: 6 },
    { name: "Финансы", slug: "finance", icon: "Landmark", sortOrder: 7 },
    { name: "Переводчики", slug: "translators", icon: "Languages", sortOrder: 8 },
    { name: "IT-услуги", slug: "it", icon: "Monitor", sortOrder: 9 },
    { name: "Прочее", slug: "other", icon: "MoreHorizontal", sortOrder: 10 },
  ]

  const specCatRecords: Record<string, { id: string }> = {}
  for (const cat of categories) {
    const record = await prisma.specialistCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    specCatRecords[cat.slug] = record
  }
  console.log(`Created ${categories.length} specialist categories`)

  // Create article categories
  const articleCategories = [
    { name: "Документы", slug: "documents" },
    { name: "Медицина", slug: "healthcare" },
    { name: "Финансы", slug: "finances" },
    { name: "Жильё", slug: "housing" },
    { name: "Транспорт", slug: "transport" },
    { name: "Связь", slug: "telecom" },
    { name: "Быт", slug: "lifestyle" },
    { name: "Работа", slug: "work" },
    { name: "Образование", slug: "education" },
  ]

  const artCatRecords: Record<string, { id: string }> = {}
  for (const cat of articleCategories) {
    const record = await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    artCatRecords[cat.slug] = record
  }
  console.log(`Created ${articleCategories.length} article categories`)

  // Create link categories
  const linkCategories = [
    { name: "Сообщества", slug: "communities" },
    { name: "Миграция", slug: "migration" },
    { name: "Сервисы", slug: "services" },
    { name: "Финансы", slug: "finances" },
    { name: "Медиа", slug: "media" },
    { name: "Развлечения", slug: "entertainment" },
  ]

  const linkCatRecords: Record<string, { id: string }> = {}
  for (const cat of linkCategories) {
    const record = await prisma.linkCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    linkCatRecords[cat.slug] = record
  }
  console.log(`Created ${linkCategories.length} link categories`)

  // ============================================================
  // Demo data: Specialists
  // ============================================================
  const specialistsData = [
    {
      name: "Анна Козлова",
      description: "Врач-терапевт с 15-летним опытом. Консультации на русском языке, помощь с медицинской страховкой.",
      phone: "+1 (212) 555-0147",
      email: "anna.kozlova@example.com",
      website: "https://drkozlova.example.com",
      countryId: usa.id,
      cityId: cityRecords["new-york"].id,
      categorySlug: "medicine",
      languages: ["ru", "en"],
    },
    {
      name: "Михаил Соколов",
      description: "Иммиграционный адвокат. Грин-карта, рабочие визы H1B, воссоединение семьи.",
      phone: "+1 (305) 555-0234",
      email: "sokolov.law@example.com",
      website: "https://sokolov-law.example.com",
      countryId: usa.id,
      cityId: cityRecords["miami"].id,
      categorySlug: "legal",
      languages: ["ru", "en", "es"],
    },
    {
      name: "Ольга Нойман",
      description: "Налоговый консультант. Помощь с декларациями, регистрация бизнеса, налоговое планирование.",
      phone: "+49 (30) 555-0189",
      email: "olga.neumann@example.com",
      countryId: germany.id,
      cityId: cityRecords["berlin"].id,
      categorySlug: "finance",
      languages: ["ru", "de", "en"],
    },
    {
      name: "Дмитрий Крюгер",
      description: "Переводчик-синхронист, присяжный переводчик. Переводы документов, сопровождение в инстанциях.",
      phone: "+49 (89) 555-0342",
      email: "krueger.translate@example.com",
      countryId: germany.id,
      cityId: cityRecords["munich"].id,
      categorySlug: "translators",
      languages: ["ru", "de"],
    },
    {
      name: "Елена Тихонова",
      description: "Косметолог и визажист. Уходовые процедуры, перманентный макияж.",
      phone: "+66 (2) 555-0567",
      countryId: thailand.id,
      cityId: cityRecords["bangkok"].id,
      categorySlug: "beauty",
      languages: ["ru", "en", "th"],
    },
    {
      name: "Сергей Волков",
      description: "IT-специалист. Создание сайтов, настройка серверов, техническая поддержка.",
      phone: "+66 (76) 555-0890",
      email: "sergey.it@example.com",
      website: "https://volkov-it.example.com",
      countryId: thailand.id,
      cityId: null, // Любой город
      categorySlug: "it",
      languages: ["ru", "en"],
    },
    {
      name: "Наталья Браун",
      description: "Риэлтор. Помощь с арендой и покупкой недвижимости, сопровождение сделок.",
      phone: "+1 (323) 555-0456",
      email: "natalia.brown@example.com",
      countryId: usa.id,
      cityId: cityRecords["los-angeles"].id,
      categorySlug: "other",
      languages: ["ru", "en"],
    },
    {
      name: "Александр Вебер",
      description: "Автомеханик. Ремонт и обслуживание всех марок. Диагностика, ТО, кузовные работы.",
      phone: "+49 (40) 555-0678",
      countryId: germany.id,
      cityId: null, // Любой город
      categorySlug: "auto",
      languages: ["ru", "de"],
    },
  ]

  for (const spec of specialistsData) {
    const { categorySlug, ...data } = spec
    const existing = await prisma.specialist.findFirst({
      where: { name: data.name, countryId: data.countryId },
    })
    if (!existing) {
      await prisma.specialist.create({
        data: {
          ...data,
          categoryId: specCatRecords[categorySlug].id,
          isActive: true,
        },
      })
    }
  }
  console.log(`Seeded ${specialistsData.length} specialists`)

  // ============================================================
  // Demo data: Articles
  // ============================================================
  const tiptapContent = (paragraphs: string[]) => ({
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  })

  const articlesData = [
    {
      title: "Как получить SSN в США",
      slug: "kak-poluchit-ssn-v-ssha",
      excerpt: "Пошаговая инструкция по получению Social Security Number для новоприбывших.",
      content: tiptapContent([
        "Social Security Number (SSN) — один из первых документов, который необходимо получить при переезде в США.",
        "Для подачи заявления вам понадобятся: паспорт, виза (или I-94), разрешение на работу (EAD) если применимо.",
        "Обратитесь в ближайший офис Social Security Administration (SSA). Записываться заранее не нужно.",
        "Заполните форму SS-5 и предоставьте оригиналы документов. Копии не принимаются.",
        "Карточка SSN придёт по почте в течение 2-4 недель. Номер можно использовать сразу после подачи заявления.",
      ]),
      type: "COUNTRY" as const,
      countryId: usa.id,
      categorySlug: "documents",
    },
    {
      title: "Медицинская страховка в США: что нужно знать",
      slug: "meditsinskaya-strakhovka-ssha",
      excerpt: "Обзор системы медицинского страхования в США для русскоязычных экспатов.",
      content: tiptapContent([
        "Система здравоохранения в США сильно отличается от привычной нам. Медицинская страховка — обязательный элемент жизни в Америке.",
        "Основные типы страховок: HMO, PPO, EPO. Каждый тип имеет свои особенности по выбору врачей и покрытию.",
        "Если ваш работодатель не предоставляет страховку, вы можете приобрести её через Healthcare.gov во время Open Enrollment.",
        "Обратите внимание на deductible, copay и out-of-pocket maximum — эти параметры определяют ваши реальные расходы.",
        "Многие русскоязычные врачи принимают большинство популярных страховок. Ищите в нашем справочнике специалистов.",
      ]),
      type: "COUNTRY" as const,
      countryId: usa.id,
      categorySlug: "healthcare",
    },
    {
      title: "Открытие банковского счёта в Германии",
      slug: "otkrytie-bankovskogo-scheta-germaniya",
      excerpt: "Какие документы нужны и какой банк выбрать для открытия счёта в Германии.",
      content: tiptapContent([
        "Банковский счёт в Германии необходим для получения зарплаты, оплаты аренды и коммунальных услуг.",
        "Для открытия счёта вам понадобятся: паспорт, регистрация по месту жительства (Anmeldung), налоговый номер.",
        "Популярные банки для экспатов: Deutsche Bank, Commerzbank, N26 (онлайн-банк), DKB.",
        "N26 и другие онлайн-банки позволяют открыть счёт удалённо, что удобно на первых этапах переезда.",
        "Обратите внимание на комиссии за обслуживание — некоторые банки предлагают бесплатные счета при определённых условиях.",
      ]),
      type: "COUNTRY" as const,
      countryId: germany.id,
      categorySlug: "finances",
    },
    {
      title: "Как адаптироваться на новом месте",
      slug: "kak-adaptirovatsya-na-novom-meste",
      excerpt: "Советы по адаптации в новой стране: язык, культура, социальные связи.",
      content: tiptapContent([
        "Переезд в новую страну — это всегда стресс. Первые месяцы самые сложные, но есть способы облегчить адаптацию.",
        "Изучайте местный язык. Даже базовые знания помогут в повседневной жизни и покажут уважение к местной культуре.",
        "Ищите русскоязычные сообщества. В каждой крупной стране есть чаты, форумы и встречи для русскоязычных.",
        "Не сравнивайте всё с родиной. Старайтесь принять новые правила и традиции как данность.",
        "Заботьтесь о ментальном здоровье. Переезд — серьёзное событие, и нормально обратиться за помощью к психологу.",
      ]),
      type: "GENERAL" as const,
      countryId: null,
      categorySlug: "lifestyle",
    },
    {
      title: "Полезные приложения для экспатов",
      slug: "poleznye-prilozheniya-dlya-ekspatov",
      excerpt: "Подборка мобильных приложений, которые пригодятся при жизни за рубежом.",
      content: tiptapContent([
        "Современные технологии значительно упрощают жизнь экспатов. Вот подборка самых полезных приложений.",
        "Google Translate — незаменимый помощник для перевода текстов, разговоров и даже вывесок через камеру.",
        "Wise (бывший TransferWise) — самый выгодный способ переводить деньги между странами.",
        "Meetup — поиск мероприятий и сообществ по интересам в вашем городе.",
        "XE Currency — конвертер валют в реальном времени. Полезен для контроля расходов.",
      ]),
      type: "GENERAL" as const,
      countryId: null,
      categorySlug: "telecom",
    },
  ]

  for (const art of articlesData) {
    const { categorySlug, ...data } = art
    const existing = await prisma.article.findFirst({ where: { slug: data.slug } })
    if (!existing) {
      await prisma.article.create({
        data: {
          ...data,
          categoryId: artCatRecords[categorySlug].id,
          authorId: superAdmin.id,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      })
    }
  }
  console.log(`Seeded ${articlesData.length} articles`)

  // ============================================================
  // Demo data: Useful Links
  // ============================================================
  const linksData = [
    {
      title: "Русский Нью-Йорк (Telegram)",
      url: "https://t.me/russian_nyc",
      description: "Крупнейший русскоязычный чат Нью-Йорка",
      countryId: usa.id,
      categorySlug: "communities",
    },
    {
      title: "USCIS — Иммиграционная служба США",
      url: "https://www.uscis.gov",
      description: "Официальный сайт иммиграционной службы",
      countryId: usa.id,
      categorySlug: "migration",
    },
    {
      title: "Make it in Germany",
      url: "https://www.make-it-in-germany.com/ru/",
      description: "Официальный портал для квалифицированных специалистов",
      countryId: germany.id,
      categorySlug: "migration",
    },
    {
      title: "Русские в Таиланде",
      url: "https://t.me/russians_thailand",
      description: "Сообщество русскоязычных в Таиланде",
      countryId: thailand.id,
      categorySlug: "communities",
    },
    {
      title: "Wise — Международные переводы",
      url: "https://wise.com",
      description: "Выгодные переводы денег между странами",
      countryId: null,
      categorySlug: "finances",
    },
    {
      title: "Numbeo — Стоимость жизни",
      url: "https://www.numbeo.com",
      description: "Сравнение стоимости жизни в разных городах мира",
      countryId: null,
      categorySlug: "services",
    },
    {
      title: "Meduza",
      url: "https://meduza.io",
      description: "Независимое русскоязычное издание",
      countryId: null,
      categorySlug: "media",
    },
    {
      title: "KinoPoisk",
      url: "https://www.kinopoisk.ru",
      description: "Крупнейшая база фильмов на русском языке",
      countryId: null,
      categorySlug: "entertainment",
    },
  ]

  for (const link of linksData) {
    const { categorySlug, ...data } = link
    const existing = await prisma.usefulLink.findFirst({ where: { url: data.url } })
    if (!existing) {
      await prisma.usefulLink.create({
        data: {
          ...data,
          categoryId: linkCatRecords[categorySlug].id,
          isActive: true,
        },
      })
    }
  }
  console.log(`Seeded ${linksData.length} useful links`)

  // ============================================================
  // Demo data: Advertisements
  // ============================================================
  const adsData = [
    {
      title: "Wise — Переводы без комиссии",
      targetUrl: "https://wise.com",
      imageUrl: "https://placehold.co/728x90/0066ff/ffffff?text=Wise+%E2%80%94+%D0%9F%D0%B5%D1%80%D0%B5%D0%B2%D0%BE%D0%B4%D1%8B",
      slot: "HERO_BANNER" as const,
      countryId: null,
    },
    {
      title: "Адвокат Соколов — Иммиграция",
      targetUrl: "https://sokolov-law.example.com",
      imageUrl: "https://placehold.co/300x250/1a1a2e/e0e0e0?text=%D0%90%D0%B4%D0%B2%D0%BE%D0%BA%D0%B0%D1%82+%D0%A1%D0%BE%D0%BA%D0%BE%D0%BB%D0%BE%D0%B2",
      slot: "SIDEBAR" as const,
      countryId: usa.id,
    },
  ]

  for (const ad of adsData) {
    const existing = await prisma.advertisement.findFirst({ where: { title: ad.title } })
    if (!existing) {
      await prisma.advertisement.create({
        data: {
          ...ad,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true,
        },
      })
    }
  }
  console.log(`Seeded ${adsData.length} advertisements`)

  // Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", theme: "default" },
  })
  console.log("Seeded site settings")

  console.log("")
  console.log("Seeding complete!")
  console.log("")
  console.log("SuperAdmin credentials:")
  console.log("  Email: admin@expatguide.com")
  console.log("  Password: admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
