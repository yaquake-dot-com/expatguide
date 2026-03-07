import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import { join } from "path"

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
  }

  const filePath = join(process.cwd(), "public", "uploads", filename)

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const ext = "." + filename.split(".").pop()?.toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
