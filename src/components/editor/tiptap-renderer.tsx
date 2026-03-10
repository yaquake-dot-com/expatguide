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
  let headingIndex = 0
  html = html.replace(/<(h[23])(\s[^>]*)?>/g, (match, tag, attrs) => {
    const heading = headings[headingIndex++]
    if (!heading) return match
    return `<${tag}${attrs || ""} id="${heading.id}">`
  })

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
