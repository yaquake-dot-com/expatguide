import { generateHTML } from "@tiptap/html"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Image from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import { type JSONContent } from "@tiptap/react"
import { extractHeadings } from "@/lib/toc"

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: {
      openOnClick: true,
      HTMLAttributes: {
        class: "text-primary underline",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    },
  }),
  Highlight,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full",
    },
  }),
]

interface TipTapRendererProps {
  content: JSONContent
  className?: string
}

export function TipTapRenderer({ content, className = "" }: TipTapRendererProps) {
  let html = generateHTML(content, extensions)

  // Inject id attributes into headings for TOC anchor links
  const headings = extractHeadings(content)
  for (const h of headings) {
    const tag = `h${h.level}`
    // Escape special regex chars in heading text
    const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(<${tag})((?:\\s[^>]*)?>\\s*${escapedText})`)
    html = html.replace(regex, `$1 id="${h.id}"$2`)
  }

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
