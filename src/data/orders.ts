import "server-only"

import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { z } from "zod"
import { db } from "@/data/db"
import { orders } from "@/data/schema"
import { newId, nowIso } from "@/data/crypto"
import { requireOwner } from "@/data/auth"
import { migrate } from "@/data/migrate"
import { rateLimit } from "@/data/rate-limit"
import { getPublishedShopService } from "@/data/content"
import { notifyOwnerAfter } from "@/data/mail"

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(4000),
  service: z.string().trim().max(80).optional(),
  company: z.string().optional(),
})

export type OrderDTO = {
  id: string
  name: string
  email: string
  message: string
  serviceSlug: string
  serviceTitle: string
  status: string
  createdAt: string
}

function toDTO(row: typeof orders.$inferSelect): OrderDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    serviceSlug: row.serviceSlug ?? "",
    serviceTitle: row.serviceTitle ?? "",
    status: row.status,
    createdAt: row.createdAt,
  }
}

export async function createPublicOrder(input: {
  name: string
  email: string
  message: string
  service?: string
  company?: string
}) {
  migrate()
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: "Проверьте имя, почту и описание задачи." }
  }
  if (input.company) return { ok: true as const }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  const limited = rateLimit(`order:${ip}`, 4, 60 * 60 * 1000)
  if (!limited.ok) {
    return { ok: false as const, error: "Слишком много заказов с этого адреса. Попробуйте позже." }
  }

  const slug = parsed.data.service || ""
  const service = slug ? await getPublishedShopService(slug) : null

  await db
    .insert(orders)
    .values({
      id: newId(),
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
      serviceSlug: service?.slug ?? null,
      serviceTitle: service?.title ?? (slug ? "Услуга снята с публикации" : "Индивидуальный запрос"),
      status: "new",
      createdAt: nowIso(),
    })
    .run()

  const title = service?.title ?? (slug ? "Услуга снята с публикации" : "Индивидуальный запрос")
  notifyOwnerAfter(
    `Заказ: ${parsed.data.name}`,
    `Имя: ${parsed.data.name}\nПочта: ${parsed.data.email}\nУслуга: ${title}\n\n${parsed.data.message}`,
  )

  return { ok: true as const }
}

export async function listOrdersForOwner(archived = false) {
  const owner = await requireOwner()
  if (!owner) return []
  migrate()
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).all()
  return rows
    .map(toDTO)
    .filter((order) => (archived ? order.status === "archived" : order.status !== "archived"))
}

export async function updateOrderStatus(id: string, status: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const allowed = [
    "new",
    "qualified",
    "in_progress",
    "delivered",
    "closed",
    "cancelled",
    "archived",
  ]
  if (!allowed.includes(status)) return { ok: false as const, error: "Неизвестный статус." }
  await db.update(orders).set({ status }).where(eq(orders.id, id)).run()
  return { ok: true as const }
}

export async function deleteArchivedOrder(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const row = await db.select().from(orders).where(eq(orders.id, id)).get()
  if (!row || row.status !== "archived") {
    return { ok: false as const, error: "Удалять можно только из архива." }
  }
  await db.delete(orders).where(eq(orders.id, id)).run()
  return { ok: true as const }
}
