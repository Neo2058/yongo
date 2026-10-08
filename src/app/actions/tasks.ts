"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createTaskFromBriefing, deleteArchivedTask, updateTaskStatus } from "@/data/tasks"
import { requireBriefingUser, requireOwner } from "@/data/auth"

export type TaskState = { error?: string } | undefined

export async function createTaskAction(
  _prev: TaskState,
  formData: FormData,
): Promise<TaskState> {
  const user = await requireBriefingUser()
  if (!user) return { error: "Нет доступа." }
  const result = await createTaskFromBriefing(
    String(formData.get("title") ?? ""),
    String(formData.get("body") ?? ""),
  )
  if (!result.ok) return { error: result.error }
  revalidatePath("/briefing")
  revalidatePath("/dashboard/todos")
  redirect("/briefing?task=1")
}

export async function updateTaskStatusAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await updateTaskStatus(String(formData.get("id") ?? ""), String(formData.get("status") ?? ""))
  revalidatePath("/dashboard/todos")
  revalidatePath(`/dashboard/todos/${String(formData.get("id") ?? "")}`)
}

export async function archiveTaskAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  const id = String(formData.get("id") ?? "")
  await updateTaskStatus(id, "archived")
  revalidatePath("/dashboard/todos")
  revalidatePath("/dashboard/todos/archive")
}

export async function deleteArchivedTaskAction(formData: FormData) {
  const owner = await requireOwner()
  if (!owner) return
  await deleteArchivedTask(String(formData.get("id") ?? ""))
  revalidatePath("/dashboard/todos")
  revalidatePath("/dashboard/todos/archive")
}