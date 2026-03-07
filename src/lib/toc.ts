import type { JSONContent } from "@tiptap/react"

export interface TocItem {
  id: string
  text: string
  level: number
}

function extractText(node: JSONContent): string {
  if (node.type === "text") return node.text || ""
  if (node.content) return node.content.map(extractText).join("")
  return ""
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function extractHeadings(content: JSONContent): TocItem[] {
  const headings: TocItem[] = []
  if (!content.content) return headings

  for (const node of content.content) {
    if (node.type === "heading" && node.attrs?.level && node.attrs.level >= 2 && node.attrs.level <= 3) {
      const text = extractText(node)
      if (text.trim()) {
        headings.push({
          id: slugify(text),
          text: text.trim(),
          level: node.attrs.level,
        })
      }
    }
  }

  return headings
}
