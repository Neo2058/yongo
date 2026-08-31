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
  if (value === "briefing" || value === "case" || value === "service") return value
  return "article"
}

export type ContentState = { error?: string; imageUrl?: string } | undefined

export async function saveContentAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const owner = await requireOwner()
  if (!owner) return { error: "Нет доступа." }

  const id = String(formData.get("id") ?? "")
  const channel = asChannel(String(formData.get("channel") ?? "public"))
  const coverUpload = formData.get("coverFile")
  let cover = String(formData.get("cover") ?? "")

  if (coverUpload instanceof File && coverUpload.size > 0) {
    const saved = await saveOwnerImage(coverUpload, channel === "internal" ? "internal" : "public")
    if (!saved.ok) return { error: saved.error }
    cover = saved.url
  }

  const result = await saveContent(
    {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      excerpt: String(formData.get("excerpt") ?? ""),
      body: String(formData.get("body") ?? ""),
      cover,
      coverAlt: String(formData.get("coverAlt") ?? ""),
      channel,
      type: asType(String(formData.get("type") ?? "article")),
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
  revalidatePath("/")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/content")
  revalidatePath("/dashboard/journal")
  redirect(channel === "internal" ? "/dashboard/journal" : "/dashboard/content")
}

export async function deleteContentAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  const id = String(formData.get("id") ?? "")
  await deleteContent(id)
  revalidatePath("/blog")
  revalidatePath("/")
  revalidatePath("/dashboard/content")
  revalidatePath("/dashboard/journal")
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
