"use server"

import { revalidatePath } from "next/cache"
import { createPublicLead, updateLeadStatus } from "@/data/leads"
import { requireOwner } from "@/data/auth"

export type LeadFormState = { error?: string; ok?: boolean } | undefined

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
  return { ok: true }
}

export async function updateLeadStatusAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateLeadStatus(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""))
  revalidatePath("/dashboard/leads")
}
