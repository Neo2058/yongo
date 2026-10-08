"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createPublicOrder, deleteArchivedOrder, updateOrderStatus } from "@/data/orders"
import { requireOwner } from "@/data/auth"

export type OrderFormState = { error?: string } | undefined

export async function submitOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const result = await createPublicOrder({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    service: String(formData.get("service") ?? ""),
    company: String(formData.get("company") ?? ""),
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/orders")
  redirect("/services?ordered=1")
}

export async function updateOrderStatusAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateOrderStatus(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""))
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/archive")
}

export async function archiveOrderAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateOrderStatus(String(formData.get("id") ?? ""), "archived")
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/archive")
}

export async function deleteArchivedOrderAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await deleteArchivedOrder(String(formData.get("id") ?? ""))
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/orders/archive")
}
