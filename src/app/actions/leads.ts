"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createPublicLead, deleteArchivedLead, updateLeadStatus } from "@/data/leads"
import { requireOwner } from "@/data/auth"

export type LeadFormState = { error?: string } | undefined

export async function submitLeadAction(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const result = await createPublicLead({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""),
    source: "contact",
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/dashboard/leads")
  redirect("/?sent=1")
}

export async function updateLeadStatusAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateLeadStatus(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""))
  revalidatePath("/dashboard/leads")
  revalidatePath("/dashboard/leads/archive")
}

export async function archiveLeadAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateLeadStatus(String(formData.get("id") ?? ""), "archived")
  revalidatePath("/dashboard/leads")
  revalidatePath("/dashboard/leads/archive")
}

export async function deleteArchivedLeadAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await deleteArchivedLead(String(formData.get("id") ?? ""))
  revalidatePath("/dashboard/leads")
  revalidatePath("/dashboard/leads/archive")
}
