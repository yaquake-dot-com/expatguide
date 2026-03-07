import fs from "fs/promises"
import path from "path"
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local"
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

// ─── R2 client (lazy singleton) ──────────────────────────────
let _r2: S3Client | null = null

function getR2Client(): S3Client {
  if (_r2) return _r2

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY env vars."
    )
  }

  _r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  return _r2
}

function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME env var.")
  return bucket
}

// ─── Helpers ─────────────────────────────────────────────────

async function ensureUploadsDir(subdir: string) {
  const dir = path.join(UPLOADS_DIR, subdir)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

function generateFileName(originalName: string): string {
  const ext = path.extname(originalName)
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 40)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${timestamp}-${random}${ext}`
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  const mimes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  }
  return mimes[ext] || "application/octet-stream"
}

// ─── Upload ──────────────────────────────────────────────────

export async function uploadFile(
  file: Buffer,
  originalName: string,
  subdir: string = "general"
): Promise<string> {
  const fileName = generateFileName(originalName)
  const key = `${subdir}/${fileName}`

  if (STORAGE_PROVIDER === "r2") {
    const client = getR2Client()
    await client.send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
        Body: file,
        ContentType: getMimeType(fileName),
        CacheControl: "public, max-age=31536000, immutable",
      })
    )
    // Return the R2 public URL directly
    const publicUrl = process.env.R2_PUBLIC_URL
    if (!publicUrl) throw new Error("Missing R2_PUBLIC_URL env var.")
    return `${publicUrl}/${key}`
  }

  // Local filesystem
  const dir = await ensureUploadsDir(subdir)
  const filePath = path.join(dir, fileName)
  await fs.writeFile(filePath, file)
  return `/uploads/${subdir}/${fileName}`
}

// ─── Delete ──────────────────────────────────────────────────

export async function deleteFile(fileUrl: string): Promise<void> {
  if (STORAGE_PROVIDER === "r2") {
    // Extract key from full R2 URL or relative path
    const publicUrl = process.env.R2_PUBLIC_URL || ""
    let key = fileUrl
    if (fileUrl.startsWith(publicUrl)) {
      key = fileUrl.slice(publicUrl.length + 1) // remove "https://pub-xxx.r2.dev/"
    }
    if (!key) return

    try {
      const client = getR2Client()
      await client.send(
        new DeleteObjectCommand({
          Bucket: getR2Bucket(),
          Key: key,
        })
      )
    } catch {
      // Object may not exist, ignore
    }
    return
  }

  // Local filesystem
  if (fileUrl.startsWith("/api/uploads/")) {
    const filename = fileUrl.replace("/api/uploads/", "")
    const filePath = path.join(process.cwd(), "public", "uploads", filename)
    try {
      await fs.unlink(filePath)
    } catch {
      // File may not exist, ignore
    }
  } else if (fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", fileUrl)
    try {
      await fs.unlink(filePath)
    } catch {
      // File may not exist, ignore
    }
  }
}

// ─── Public URL ──────────────────────────────────────────────

export function getPublicUrl(storedPath: string): string {
  if (STORAGE_PROVIDER === "r2") {
    // If already a full URL, return as-is
    if (storedPath.startsWith("http")) return storedPath
    const r2PublicUrl = process.env.R2_PUBLIC_URL
    return `${r2PublicUrl}/${storedPath}`
  }
  return storedPath
}
