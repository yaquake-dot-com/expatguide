"use client"

import { useState } from "react"
import { ChevronDown, List } from "lucide-react"
import type { JSONContent } from "@tiptap/react"
import { cn } from "@/lib/utils"
import { extractHeadings } from "@/lib/toc"

interface TableOfContentsProps {
  content: JSONContent
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [open, setOpen] = useState(true)
  const headings = extractHeadings(content)

  if (headings.length < 2) return null

  return (
    <nav className="mb-8 rounded-lg border bg-muted/30 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left text-sm font-semibold text-foreground"
      >
        <List className="h-4 w-4" />
        Содержание
        <ChevronDown
          className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ol className="mt-3 space-y-1 text-sm">
          {headings.map((h) => (
            <li key={h.id} className={cn(h.level === 3 && "pl-4")}>
              <a
                href={`#${h.id}`}
                className="block rounded px-2 py-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  )
}
