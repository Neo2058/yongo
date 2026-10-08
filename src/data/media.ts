import "server-only"

import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { db } from "@/data/db"
import { mediaFiles } from "@/data/schema"
import { newId, nowIso, randomToken } from "@/data/crypto"
import { requireOwner } from "@/data/auth"
import { eq } from "drizzle-orm"

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["audio/mpeg", ".mp3"],
  ["audio/mp4", ".m4a"],
  ["audio/wav", ".wav"],
  ["audio/ogg", ".ogg"],
  ["audio/webm", ".weba"],
])

const MAX_BYTES = 40 * 1024 * 1024

export async function saveOwnerImage(file: File, visibility: "public" | "internal") {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  if (!file || file.size === 0) return { ok: false as const, error: "Файл не выбран." }
  if (file.size > MAX_BYTES) return { ok: false as const, error: "Файл больше 5 МБ." }

  const ext = ALLOWED.get(file.type)
  if (!ext) return { ok: false as const, error: "Нужен JPEG, PNG, WebP, GIF, MP4, WebM, MP3, WAV или OGG." }

  const filename = `${randomToken()}${ext}`
  const dir = path.join(process.cwd(), "storage", visibility)
  mkdirSync(dir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  writeFileSync(path.join(dir, filename), buffer)

  await db.insert(mediaFiles)
    .values({
      id: newId(),
      filename,
      originalName: file.name.slice(0, 180),
      mime: file.type,
      visibility,
      createdAt: nowIso(),
    })
    .run()

  const url = visibility === "public" ? `/media/public/${filename}` : `/media/internal/${filename}`
  return { ok: true as const, url, filename }
}

export async function getMediaRecord(filename: string) {
  return await db.select().from(mediaFiles).where(eq(mediaFiles.filename, filename)).get()
}
