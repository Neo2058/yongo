import "server-only"

import { desc, eq } from "drizzle-orm"
import { db } from "@/data/db"
import { tasks } from "@/data/schema"
import { newId, nowIso } from "@/data/crypto"
import { requireBriefingUser, requireOwner } from "@/data/auth"
import { migrate } from "@/data/migrate"

export type TaskDTO = {
  id: string
  title: string
  body: string
  authorId: string
  authorName: string
  status: "new" | "in_progress" | "done" | "archived"
  createdAt: string
  updatedAt: string
}

function toDTO(row: typeof tasks.$inferSelect): TaskDTO {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorId: row.authorId,
    authorName: row.authorName,
    status: row.status as TaskDTO["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function createTaskFromBriefing(title: string, body: string) {
  const user = await requireBriefingUser()
  if (!user) return { ok: false as const, error: "Нет доступа." }
  migrate()
  const trimmed = title.trim()
  const text = body.trim()
  if (trimmed.length < 3) return { ok: false as const, error: "Заголовок слишком короткий." }
  if (text.length < 5) return { ok: false as const, error: "Опишите задачу." }

  await db.insert(tasks).values({
    id: newId(),
    title: trimmed,
    body: text,
    authorId: user.id,
    authorName: user.name || user.email,
    status: "new",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }).run()
  return { ok: true as const }
}

export async function listTasksForOwner(archived = false) {
  const owner = await requireOwner()
  if (!owner) return []
  migrate()
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt)).all()
  return rows
    .map(toDTO)
    .filter((task) => (archived ? task.status === "archived" : task.status !== "archived"))
}

export async function getTaskForOwner(id: string) {
  const owner = await requireOwner()
  if (!owner) return null
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get()
  return row ? toDTO(row) : null
}

export async function updateTaskStatus(id: string, status: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  if (!["new", "in_progress", "done", "archived"].includes(status)) {
    return { ok: false as const, error: "Неизвестный статус." }
  }
  await db.update(tasks).set({ status, updatedAt: nowIso() }).where(eq(tasks.id, id)).run()
  return { ok: true as const }
}

export async function deleteArchivedTask(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const row = await db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!row || row.status !== "archived") {
    return { ok: false as const, error: "Удалять можно только из архива." }
  }
  await db.delete(tasks).where(eq(tasks.id, id)).run()
  return { ok: true as const }
}
