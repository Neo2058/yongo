"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireOwner } from "@/data/auth"
import {
  deleteContent,
  saveContent,
  type ContentChannel,
  type ContentStatus,
  type ContentType,
} from "@/data/content"
import { saveOwnerImage } from "@/data/media"

function asChannel(value: string): ContentChannel {
  if (value === "internal" || value === "shop") return value
  return "public"
}

function asStatus(value: string): ContentStatus {
  if (value === "published" || value === "archived") return value
  return "draft"
}

function asType(value: string): ContentType {
  if (value === "briefing" || value === "case" || value === "service" || value === "page") {
    return value
  }
  return "article"
}

export type ContentState = { error?: string; imageUrl?: string } | undefined

export async function saveContentAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const owner = await requireOwner()
  if (!owner) return { error: "Нет доступа." }

  const uploads = [formData.get("coverFile"), formData.get("bodyFile")]
  const totalBytes = uploads.reduce<number>((total, file) => total + (file instanceof File ? file.size : 0), 0)
  if (totalBytes > 40 * 1024 * 1024) return { error: "Суммарный размер файлов больше 40 МБ." }
  const id = String(formData.get("id") ?? "")
  const channel = asChannel(String(formData.get("channel") ?? "public"))
  const coverUpload = formData.get("coverFile")
  let cover = String(formData.get("cover") ?? "")
  const visibility = channel === "internal" ? "internal" : "public"

  if (coverUpload instanceof File && coverUpload.size > 0) {
    const saved = await saveOwnerImage(coverUpload, visibility)
    if (!saved.ok) return { error: saved.error }
    cover = saved.url
  }

  let body = String(formData.get("body") ?? "")
  const bodyFile = formData.get("bodyFile")
  if (bodyFile instanceof File && bodyFile.size > 0) {
    const saved = await saveOwnerImage(bodyFile, visibility)
    if (!saved.ok) return { error: saved.error }
    body = `${body.trim()}\n\n![${bodyFile.name}](${saved.url})`
  }

  const type = asType(String(formData.get("type") ?? "article"))
  const result = await saveContent(
    {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      excerpt: String(formData.get("excerpt") ?? ""),
      body,
      cover,
      coverAlt: String(formData.get("coverAlt") ?? ""),
      channel,
      type,
      status: asStatus(String(formData.get("status") ?? "draft")),
      featured: formData.get("featured") === "on",
      kicker: String(formData.get("kicker") ?? ""),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    },
    id || undefined,
  )

  if (!result.ok) return { error: result.error }

  revalidatePath("/blog")
  revalidatePath("/services")
  revalidatePath("/work")
  revalidatePath("/about")
  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/content")
  revalidatePath("/dashboard/journal")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/pages")
  redirect(
    type === "page"
      ? "/dashboard/pages"
      : channel === "internal"
        ? "/dashboard/journal"
        : channel === "shop"
          ? "/dashboard/services"
          : "/dashboard/content",
  )
}

export async function deleteContentAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  const id = String(formData.get("id") ?? "")
  await deleteContent(id)
  revalidatePath("/blog")
  revalidatePath("/services")
  revalidatePath("/work")
  revalidatePath("/about")
  revalidatePath("/")
  revalidatePath("/dashboard/content")
  revalidatePath("/dashboard/journal")
  revalidatePath("/dashboard/services")
  revalidatePath("/dashboard/pages")
}

export async function uploadBodyImageAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const owner = await requireOwner()
  if (!owner) return { error: "Нет доступа." }
  const file = formData.get("image")
  const channel = asChannel(String(formData.get("channel") ?? "public"))
  if (!(file instanceof File)) return { error: "Файл не выбран." }
  const saved = await saveOwnerImage(file, channel === "internal" ? "internal" : "public")
  if (!saved.ok) return { error: saved.error }
  return { imageUrl: saved.url }
}
