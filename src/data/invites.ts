import "server-only"

import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/data/db"
import { invites, users } from "@/data/schema"
import { hashPassword, hashToken, newId, nowIso, randomToken } from "@/data/crypto"
import { createSession, disableManager, requireOwner } from "@/data/auth"
import { migrate } from "@/data/migrate"
import { rateLimit } from "@/data/rate-limit"
import { originFromHeaders } from "@/data/site-url"

export type InviteDTO = {
  id: string
  name: string
  email: string
  status: "pending" | "active" | "revoked"
  usedAt: string | null
  createdAt: string
}

function statusOf(row: typeof invites.$inferSelect): InviteDTO["status"] {
  if (row.revokedAt) return "revoked"
  if (row.usedAt) return "active"
  return "pending"
}

export async function listInvitesForOwner() {
  const owner = await requireOwner()
  if (!owner) return []
  migrate()
  const rows = await db.select().from(invites).orderBy(desc(invites.createdAt)).all()
  return rows.map(
    (row): InviteDTO => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: statusOf(row),
      usedAt: row.usedAt,
      createdAt: row.createdAt,
    }),
  )
}

export async function createInvite(name: string, email: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  migrate()

  const trimmedName = name.trim()
  const normalized = email.trim().toLowerCase()
  if (trimmedName.length < 2) return { ok: false as const, error: "Укажите имя руководителя." }
  if (!normalized.includes("@")) return { ok: false as const, error: "Укажите почту руководителя." }

  const existingUser = await db.select().from(users).where(eq(users.email, normalized)).get()
  if (existingUser && !existingUser.disabledAt) {
    return { ok: false as const, error: "Этот email уже имеет доступ. Сначала отзовите его." }
  }

  const open = await db.select().from(invites).where(eq(invites.email, normalized)).all()
  if (open.some((row) => !row.revokedAt)) {
    return { ok: false as const, error: "Для этой почты уже есть приглашение или действующий доступ. Сначала отзовите его." }
  }

  const token = randomToken()
  await db.insert(invites).values({
    id: newId(),
    tokenHash: hashToken(token),
    name: trimmedName,
    email: normalized,
    role: "manager",
    expiresAt: "9999-12-31T00:00:00.000Z",
    createdAt: nowIso(),
  }).run()

  const origin = originFromHeaders(await headers())
  return {
    ok: true as const,
    url: `${origin}/i/${token}`,
    email: normalized,
  }
}

export async function revokeInvite(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const row = await db.select().from(invites).where(eq(invites.id, id)).get()
  if (!row) return { ok: false as const, error: "Приглашение не найдено." }
  await db.update(invites).set({ revokedAt: nowIso() }).where(eq(invites.id, id)).run()
  if (row.createdUserId) {
    await disableManager(row.createdUserId)
  }
  return { ok: true as const }
}

export async function getPendingInvite(token: string) {
  migrate()
  if (!token || token.length < 20) return null
  const row = await db.select().from(invites).where(eq(invites.tokenHash, hashToken(token))).get()
  if (!row) return null
  if (statusOf(row) !== "pending") return null
  return row
}

export async function acceptInvite(token: string, password: string) {
  migrate()
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  const limited = rateLimit(`invite:${ip}`, 8, 15 * 60 * 1000)
  if (!limited.ok) return { ok: false as const, error: "Слишком много попыток." }
  if (password.length < 10) {
    return { ok: false as const, error: "Пароль не короче 10 символов." }
  }

  const invite = await getPendingInvite(token)
  if (!invite) return { ok: false as const, error: "not-found" }

  const existing = await db.select().from(users).where(eq(users.email, invite.email)).get()
  let userId = existing?.id
  if (existing && !existing.disabledAt) return { ok: false as const, error: "not-found" }

  const passwordHash = await hashPassword(password)
  if (existing && userId) {
    await db
      .update(users)
      .set({
        passwordHash,
        name: invite.name,
        disabledAt: null,
        role: "manager",
      })
      .where(eq(users.id, userId))
      .run()
  } else {
    userId = newId()
    await db.insert(users).values({
      id: userId,
      email: invite.email,
      name: invite.name,
      passwordHash,
      role: "manager",
      createdAt: nowIso(),
    }).run()
  }

  await db.update(invites).set({
    usedAt: nowIso(),
    createdUserId: userId,
  }).where(eq(invites.id, invite.id)).run()

  await createSession(userId)
  return { ok: true as const }
}
