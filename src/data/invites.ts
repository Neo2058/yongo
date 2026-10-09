import "server-only"

import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db, sqlite } from "@/data/db"
import { invites, sessions, users } from "@/data/schema"
import { hashPassword, hashToken, newId, nowIso, randomToken } from "@/data/crypto"
import { createSession, requireOwner } from "@/data/auth"
import { migrate } from "@/data/migrate"
import { rateLimit } from "@/data/rate-limit"
import { requestIp } from "@/data/request-ip"
import { publicSiteUrl } from "@/data/site-url"
import { z } from "zod"

export type InviteDTO = {
  id: string
  name: string
  email: string
  status: "pending" | "active" | "revoked" | "expired"
  usedAt: string | null
  createdAt: string
}

function statusOf(row: typeof invites.$inferSelect): InviteDTO["status"] {
  if (row.revokedAt) return "revoked"
  if (row.usedAt) return "active"
  if (!(Date.parse(row.expiresAt) > Date.now())) return "expired"
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
  if (trimmedName.length < 2 || trimmedName.length > 80) return { ok: false as const, error: "Укажите имя руководителя." }
  if (!z.email().max(120).safeParse(normalized).success) return { ok: false as const, error: "Укажите почту руководителя." }

  const origin = publicSiteUrl()
  const token = randomToken()
  return sqlite.transaction(() => {
    const existingUser = db.select().from(users).where(eq(users.email, normalized)).get()
    if (existingUser && (!existingUser.disabledAt || existingUser.role !== "manager")) {
      return { ok: false as const, error: "Этот email уже имеет доступ. Сначала отзовите его." }
    }
    const open = db.select().from(invites).where(eq(invites.email, normalized)).all()
    if (open.some((row) => ["pending", "active"].includes(statusOf(row)))) {
      return { ok: false as const, error: "Для этой почты уже есть приглашение или действующий доступ. Сначала отзовите его." }
    }
    db.insert(invites).values({
      id: newId(), tokenHash: hashToken(token), name: trimmedName, email: normalized,
      role: "manager", expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: nowIso(),
    }).run()
    return { ok: true as const, url: `${origin}/i/${token}`, email: normalized }
  }).immediate()
}

export async function revokeInvite(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  migrate()
  return sqlite.transaction(() => {
    const row = db.select().from(invites).where(eq(invites.id, id)).get()
    if (!row) return { ok: false as const, error: "Приглашение не найдено." }
    if (row.revokedAt) return { ok: true as const }
    const now = nowIso()
    db.update(invites).set({ revokedAt: now }).where(eq(invites.id, id)).run()
    if (row.createdUserId) {
      db.update(users).set({ disabledAt: now }).where(eq(users.id, row.createdUserId)).run()
      db.update(sessions).set({ revokedAt: now }).where(eq(sessions.userId, row.createdUserId)).run()
    }
    return { ok: true as const }
  }).immediate()
}

export async function getPendingInvite(token: string) {
  migrate()
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null
  const row = await db.select().from(invites).where(eq(invites.tokenHash, hashToken(token))).get()
  if (!row) return null
  if (statusOf(row) !== "pending") return null
  return row
}

export async function acceptInvite(token: string, password: string) {
  migrate()
  const ip = requestIp(await headers())
  const limited = rateLimit(`invite:${ip}`, 8, 15 * 60 * 1000)
  if (!limited.ok) return { ok: false as const, error: "Слишком много попыток." }
  if (password.length < 12 || password.length > 256) {
    return { ok: false as const, error: "Пароль должен содержать от 12 до 256 символов." }
  }

  const invite = await getPendingInvite(token)
  if (!invite) return { ok: false as const, error: "not-found" }

  const passwordHash = await hashPassword(password)
  // All checks and writes below are synchronous within an immediate transaction.
  // A revoke/second accept during scrypt is observed before changing the account.
  const userId = sqlite.transaction(() => {
    const pending = db.select().from(invites).where(eq(invites.id, invite.id)).get()
    if (!pending || statusOf(pending) !== "pending" || pending.role !== "manager") return null
    const existing = db.select().from(users).where(eq(users.email, pending.email)).get()
    if (existing && (!existing.disabledAt || existing.role !== "manager")) return null
    const id = existing?.id ?? newId()
    if (existing) {
      db.update(users).set({ passwordHash, name: pending.name, disabledAt: null })
        .where(eq(users.id, id)).run()
      db.update(sessions).set({ revokedAt: nowIso() }).where(eq(sessions.userId, id)).run()
    } else {
      db.insert(users).values({
        id, email: pending.email, name: pending.name, passwordHash,
        role: "manager", createdAt: nowIso(),
      }).run()
    }
    db.update(invites).set({ usedAt: nowIso(), createdUserId: id })
      .where(eq(invites.id, pending.id)).run()
    return id
  }).immediate()
  if (!userId || !await createSession(userId, passwordHash)) return { ok: false as const, error: "not-found" }
  return { ok: true as const }
}
