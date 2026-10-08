"use server"

import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { acceptInvite, createInvite, revokeInvite } from "@/data/invites"
import { requireOwner } from "@/data/auth"

export type InviteState = { error?: string; url?: string; email?: string } | undefined

export async function createInviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const owner = await requireOwner()
  if (!owner) return { error: "Нет доступа." }
  const result = await createInvite(
    String(formData.get("name") ?? ""),
    String(formData.get("email") ?? ""),
  )
  if (!result.ok) return { error: result.error }
  revalidatePath("/dashboard/access")
  return { url: result.url, email: result.email }
}

export async function revokeInviteAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await revokeInvite(String(formData.get("id") ?? ""))
  revalidatePath("/dashboard/access")
}

export async function acceptInviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const token = String(formData.get("token") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirm") ?? "")
  if (password !== confirm) return { error: "Пароли не совпадают." }
  const result = await acceptInvite(token, password)
  if (!result.ok) {
    if (result.error === "not-found") notFound()
    return { error: result.error }
  }
  redirect("/briefing")
}