"use client"

import { useState } from "react"
import { Phone, Mail, Eye } from "lucide-react"

interface ProtectedContactProps {
  value: string
  type: "phone" | "email"
}

function obfuscatePhone(phone: string): string {
  // Show first 4 chars and last 2, mask the rest
  if (phone.length <= 6) return phone.slice(0, 2) + "***"
  return phone.slice(0, 4) + " ***-**" + phone.slice(-2)
}

function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return "***@***"
  return local.charAt(0) + "***@" + domain
}

export function ProtectedContact({ value, type }: ProtectedContactProps) {
  const [revealed, setRevealed] = useState(false)

  const obfuscated = type === "phone" ? obfuscatePhone(value) : obfuscateEmail(value)
  const Icon = type === "phone" ? Phone : Mail
  const href = type === "phone" ? `tel:${value}` : `mailto:${value}`

  if (revealed) {
    return (
      <a
        href={href}
        className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground transition-colors hover:bg-accent/80"
      >
        <Icon className="h-3 w-3" />
        {value}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground transition-colors hover:bg-accent/80"
    >
      <Icon className="h-3 w-3" />
      <span>{obfuscated}</span>
      <Eye className="ml-0.5 h-3 w-3 opacity-50" />
    </button>
  )
}
