import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadFile } from "@/lib/storage"

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер — 10 МБ" },
        { status: 413 },
      )
    }

    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимальный размер — 10 МБ" },
        { status: 413 },
      )
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "application/pdf", "application/zip",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Тип файла «${file.type}» не поддерживается` },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(buffer, file.name, "general")
    const filename = file.name

    return NextResponse.json({ url, filename })

  } catch (error) {
    console.error("Upload error:", error)
    const message = error instanceof Error ? error.message : "Не удалось загрузить файл"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
