import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin } from "lucide-react"
import { ProtectedContact } from "@/components/shared/protected-contact"

const LANGUAGE_LABELS: Record<string, string> = {
  ru: "RU",
  en: "EN",
  de: "DE",
  th: "TH",
  es: "ES",
  fr: "FR",
  he: "HE",
  tr: "TR",
}

interface SpecialistCardProps {
  name: string
  description?: string | null
  categoryName: string
  cityName?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  image?: string | null
  languages?: string[]
}

export function SpecialistCard({
  name,
  description,
  categoryName,
  cityName,
  phone,
  email,
  website,
  image,
  languages,
}: SpecialistCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            {image ? (
              <Image
                src={image}
                alt={name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-primary">
                {name.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight">{name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {categoryName}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {cityName || "Все города"}
              </span>
            </div>
          </div>
        </div>

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {LANGUAGE_LABELS[lang] || lang.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Contact links */}
        <div className="mt-3 flex flex-col items-start gap-1.5">
          {phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0">Тел:</span>
              <ProtectedContact type="phone" value={phone} />
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0">Почта:</span>
              <ProtectedContact type="email" value={email} />
            </div>
          )}
          {website && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="shrink-0">Сайт:</span>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground transition-colors hover:bg-accent/80"
              >
                <Globe className="h-3 w-3" />
                {new URL(website).hostname.replace("www.", "")}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
