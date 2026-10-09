import "server-only"

import { and, eq } from "drizzle-orm"
import { db } from "@/data/db"
import { contents, mediaFiles } from "@/data/schema"
import { migrate } from "@/data/migrate"

export function contentMediaUrls(cover: string, body: string) {
  const urls = new Set<string>(cover ? [cover] : [])
  for (const block of body.replaceAll("\r\n", "\n").trim().split(/\n{2,}/)) {
    const match = block.trim().match(/^!\[[^\]]*\]\(([^)]+)\)$/)
    if (match) urls.add(match[1])
  }
  return [...urls]
}

export function mediaIsPublished(filename: string, visibility: "public" | "internal") {
  migrate()
  const url = `/media/${visibility}/${filename}`
  const rows = db.select().from(contents).where(eq(contents.status, "published")).all()
  return rows.some((row) => {
    const accessible = visibility === "internal"
      ? row.channel === "internal"
      : (row.channel === "public" && ["article", "page", "case"].includes(row.type)) ||
        (row.channel === "shop" && row.type === "service")
    return accessible && contentMediaUrls(row.cover ?? "", row.body).includes(url)
  })
}

export function validateContentMedia(cover: string, body: string, channel: string) {
  const visibility = channel === "internal" ? "internal" : "public"
  if (cover && !/^\/(?:images|media\/(?:public|internal))\/[A-Za-z0-9_./-]+$/.test(cover)) {
    return "Обложка должна быть локальным изображением сайта."
  }
  for (const url of contentMediaUrls(cover, body)) {
    if (url.includes("..")) return "Недопустимый путь к файлу."
    if (!url.startsWith("/media/")) continue
    const match = url.match(/^\/media\/(public|internal)\/([A-Za-z0-9_-]{43}\.[a-z0-9]+)$/)
    if (!match || match[1] !== visibility) {
      return "Для нового канала загрузите вложения заново: публичные и закрытые файлы нельзя смешивать."
    }
    const record = db.select().from(mediaFiles)
      .where(and(eq(mediaFiles.filename, match[2]), eq(mediaFiles.visibility, visibility))).get()
    if (!record) return "Вложение не найдено. Загрузите файл заново."
  }
  return null
}
