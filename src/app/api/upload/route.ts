import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "application/pdf", "application/zip",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    const isLocal = process.env.STORAGE_PROVIDER !== "r2"

    if (isLocal) {
      // Local storage
      const ext = file.name.split(".").pop() || "bin"
      const filename = `${randomUUID()}.${ext}`
      const uploadDir = join(process.cwd(), "public", "uploads")

      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await file.arrayBuffer())
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)

      const url = `/api/uploads/${filename}`
      return NextResponse.json({ url, filename })
    }

    // R2 upload would go here (Phase 8 / production)
    // For now, fall back to local
    return NextResponse.json({ error: "R2 not configured" }, { status: 500 })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
