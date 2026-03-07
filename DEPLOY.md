# Деплой ExpatGuide на Vercel

## Предварительные требования

- Аккаунт [Vercel](https://vercel.com)
- Аккаунт [Neon](https://neon.tech) (PostgreSQL) — бесплатный тариф подходит
- Репозиторий на GitHub/GitLab/Bitbucket
- (Опционально) [Cloudflare R2](https://www.cloudflare.com/r2/) для файлов

---

## Шаг 1. База данных (Neon)

1. Зарегистрируйся на [neon.tech](https://neon.tech) и создай проект
2. Создай базу данных `expatguide`
3. Скопируй connection string, он будет вида:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/expatguide?sslmode=require
   ```
4. Запусти миграции локально, указав Neon URL:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/expatguide?sslmode=require" npx prisma migrate deploy
   ```
5. Засей базу начальными данными:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/expatguide?sslmode=require" npm run db:seed
   ```

---

## Шаг 2. Запушить код на GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Шаг 3. Создать проект на Vercel

1. Зайди на [vercel.com/new](https://vercel.com/new)
2. Импортируй репозиторий с GitHub
3. **Framework Preset**: Next.js (определится автоматически)
4. **Build Command**: оставь по умолчанию (`npm run build`) — скрипт уже включает `prisma generate`
5. **Output Directory**: оставь по умолчанию

---

## Шаг 4. Переменные окружения

В настройках проекта на Vercel (Settings → Environment Variables) добавь:

| Переменная | Значение | Обязательна |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/expatguide?sslmode=require` | Да |
| `AUTH_SECRET` | Сгенерируй: `openssl rand -hex 32` | Да |
| `AUTH_URL` | `https://твой-домен.vercel.app` | Да |
| `AUTH_TRUST_HOST` | `true` | Да |
| `NEXT_PUBLIC_APP_URL` | `https://твой-домен.vercel.app` | Да |
| `STORAGE_PROVIDER` | `local` (или `r2` если настроен R2) | Да |

### Для Email (Magic Link) — опционально:

| Переменная | Значение |
|---|---|
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` или другой SMTP |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | Email аккаунт |
| `EMAIL_SERVER_PASSWORD` | Пароль приложения |
| `EMAIL_FROM` | `noreply@your-domain.com` |

### Для Cloudflare R2 — опционально:

| Переменная | Значение |
|---|---|
| `R2_ACCOUNT_ID` | ID аккаунта Cloudflare |
| `R2_ACCESS_KEY_ID` | API ключ |
| `R2_SECRET_ACCESS_KEY` | Секретный ключ |
| `R2_BUCKET_NAME` | `expatguide` |
| `R2_PUBLIC_URL` | `https://pub-xxx.r2.dev` |

---

## Шаг 5. Деплой

1. Нажми **Deploy** на Vercel
2. Дождись окончания билда (2-3 минуты)
3. Проверь сайт по выданному URL

---

## Шаг 6. Настроить домен (опционально)

1. В Vercel: Settings → Domains → добавь свой домен
2. У регистратора домена: добавь CNAME запись `cname.vercel-dns.com`
3. Обнови `AUTH_URL` и `NEXT_PUBLIC_APP_URL` на новый домен

---

## Важные заметки

### Хранение файлов (Cloudflare R2)
На Vercel файловая система **read-only** — загруженные файлы не сохраняются между деплоями. R2-адаптер уже реализован в `src/lib/storage.ts`.

Чтобы включить R2:
1. Создай бакет в Cloudflare R2 (например `expatguide`)
2. Создай API-токен (R2 > Manage R2 API Tokens) с правами на чтение/запись
3. Включи **публичный доступ** к бакету (Settings → Public access → Enable) — скопируй публичный URL
4. Установи переменные окружения (см. таблицу выше):
   - `STORAGE_PROVIDER=r2`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
5. Redeploy

Для **локальной разработки** оставь `STORAGE_PROVIDER=local` — файлы сохраняются в `public/uploads/`.

### Геолокация
Middleware (`src/proxy.ts`) использует заголовок `x-vercel-ip-country` — он автоматически доступен на Vercel. Страна определяется по IP посетителя.

### Кэш темы
Тема кэшируется на 60 секунд. После смены темы в админке изменения появятся в течение минуты.

### Первый вход
После деплоя зайди в `/auth/signin`:
- **Email**: `admin@expatguide.com`
- **Пароль**: `admin123`

**Обязательно смени пароль после первого входа!**

---

## Обновление

При каждом пуше в `main` Vercel автоматически деплоит новую версию.

Если менялась схема Prisma:
```bash
DATABASE_URL="..." npx prisma migrate deploy
```

---

## Troubleshooting

| Проблема | Решение |
|---|---|
| `PrismaClientInitializationError` | Проверь `DATABASE_URL` в Vercel env vars |
| Страница 500 | Проверь логи: Vercel Dashboard → Deployments → Functions |
| Файлы не загружаются | Настрой внешнее хранилище (R2/Blob) |
| Тема не меняется | Подожди 60 сек или redeploy |
| Auth ошибки | Проверь `AUTH_SECRET` и `AUTH_URL` |
