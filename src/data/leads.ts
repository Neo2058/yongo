import "server-only"

import { desc, eq } from "drizzle-orm"
import { db } from "@/data/db"
import { leads } from "@/data/schema"
import { newId, nowIso } from "@/data/crypto"
import { requireOwner } from "@/data/auth"
import { rateLimit } from "@/data/rate-limit"
import { headers } from "next/headers"
import { z } from "zod"
import { migrate } from "@/data/migrate"
import { notifyOwnerAfter } from "@/data/mail"

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  message: z.string().trim().min(10).max(4000),
  company: z.string().optional(),
})

export type LeadDTO = {
  id: string
  name: string
  email: string
  message: string
  source: string
  status: string
  createdAt: string
}

export async function createPublicLead(input: {
  name: string
  email: string
  message: string
  company?: string
  source?: string
}) {
  migrate()
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, error: "Проверьте имя, почту и текст заявки." }
  }
  if (input.company) {
    return { ok: true as const }
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  const limited = rateLimit(`lead:${ip}`, 4, 60 * 60 * 1000)
  if (!limited.ok) {
    return { ok: false as const, error: "Слишком много заявок с этого адреса. Попробуйте позже." }
  }

  await db.insert(leads)
    .values({
      id: newId(),
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
      source: input.source ?? "contact",
      status: "new",
      createdAt: nowIso(),
    })
    .run()

  notifyOwnerAfter(
    `Заявка: ${parsed.data.name}`,
    `Имя: ${parsed.data.name}\nПочта: ${parsed.data.email}\nИсточник: ${input.source ?? "contact"}\n\n${parsed.data.message}`,
  )

  return { ok: true as const }
}

export async function updateLeadStatus(id: string, status: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const allowed = ["new", "qualified", "closed", "archived"]
  if (!allowed.includes(status)) return { ok: false as const, error: "Неизвестный статус." }
  await db.update(leads).set({ status }).where(eq(leads.id, id)).run()
  return { ok: true as const }
}

export async function listLeadsForOwner(archived = false) {
  const owner = await requireOwner()
  if (!owner) return []
  const rows = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .all()
  return rows
    .map(
      (row): LeadDTO => ({
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        source: row.source,
        status: row.status,
        createdAt: row.createdAt,
      }),
    )
    .filter((lead) => (archived ? lead.status === "archived" : lead.status !== "archived"))
}

export async function deleteArchivedLead(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const row = await db.select().from(leads).where(eq(leads.id, id)).get()
  if (!row || row.status !== "archived") {
    return { ok: false as const, error: "Удалять можно только из архива." }
  }
  await db.delete(leads).where(eq(leads.id, id)).run()
  return { ok: true as const }
}
