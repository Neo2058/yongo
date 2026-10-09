import "server-only"

import { and, eq, isNull } from "drizzle-orm"
import { cache } from "react"
import { cookies, headers } from "next/headers"
import { db, sqlite } from "@/data/db"
import { hashPassword, hashToken, newId, nowIso, randomToken, verifyPassword } from "@/data/crypto"
import { migrate } from "@/data/migrate"
import { rateLimit } from "@/data/rate-limit"
import { requestIp } from "@/data/request-ip"
import { sessions, users } from "@/data/schema"
import { z } from "zod"

const COOKIE = "yongo_session"
const SESSION_DAYS = 14

export type SessionUser = {
  id: string
  email: string
  name: string
  role: "owner" | "manager"
}

function asRole(value: string): SessionUser["role"] | null {
  return value === "manager" || value === "owner" ? value : null
}

export async function bootstrap() {
  migrate()
  if (db.select({ id: users.id }).from(users).limit(1).get()) return
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD
  if (!email || !z.email().max(120).safeParse(email).success || !password || password === "change-me-at-least-10" || password.length < 12 || password.length > 256) {
    throw new Error("Set OWNER_EMAIL and a unique OWNER_PASSWORD (12–256 characters) before initializing the database.")
  }
  const passwordHash = await hashPassword(password)
  sqlite.transaction(() => {
    // Recheck after scrypt: concurrent first requests must not create extra owners.
    if (db.select({ id: users.id }).from(users).limit(1).get()) return
    db.insert(users).values({
      id: newId(), email, name: "Владелец", passwordHash,
      role: "owner", createdAt: nowIso(),
    }).run()
  }).immediate()
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  await bootstrap()
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null

  const row = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      revokedAt: sessions.revokedAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      disabledAt: users.disabledAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt)))
    .get()

  if (!row) return null
  if (row.disabledAt) return null
  const role = asRole(row.role)
  if (!role || !(new Date(row.expiresAt).getTime() > Date.now())) return null

  await db
    .update(sessions)
    .set({ lastSeenAt: nowIso() })
    .where(eq(sessions.id, row.sessionId))
    .run()

  return {
    id: row.userId,
    email: row.email,
    name: row.name || row.email,
    role,
  }
})

export async function requireOwner() {
  const user = await getSessionUser()
  if (!user || user.role !== "owner") return null
  return user
}

export async function requireBriefingUser() {
  const user = await getSessionUser()
  if (!user || (user.role !== "owner" && user.role !== "manager")) return null
  return user
}

export async function createSession(userId: string, expectedPasswordHash?: string) {
  const token = randomToken()
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  migrate()
  const created = sqlite.transaction(() => {
    const user = db.select().from(users).where(eq(users.id, userId)).get()
    if (!user || user.disabledAt || !asRole(user.role) ||
        (expectedPasswordHash !== undefined && user.passwordHash !== expectedPasswordHash)) return false
    db.insert(sessions).values({
      id: newId(),
      userId,
      tokenHash: hashToken(token),
      expiresAt: expires.toISOString(),
      lastSeenAt: nowIso(),
    }).run()
    return true
  }).immediate()
  if (!created) return false
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  })
  return true
}

export async function loginUser(email: string, password: string, ownerOnly = false) {
  await bootstrap()
  const ip = requestIp(await headers())
  const limited = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
  if (!limited.ok) {
    return { ok: false as const, error: "Слишком много попыток. Подождите 15 минут." }
  }

  const normalized = email.trim().toLowerCase()
  if (normalized.length > 120 || password.length > 256 || !password) {
    return { ok: false as const, error: "Неверная почта или пароль." }
  }
  if (!rateLimit(`login-account:${normalized}`, 20, 15 * 60 * 1000).ok) {
    return { ok: false as const, error: "Слишком много попыток. Подождите 15 минут." }
  }
  const user = await db.select().from(users).where(eq(users.email, normalized)).get()
  const dummy = "00".repeat(16) + ":" + "00".repeat(64)
  const valid = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, dummy)

  const role = user ? asRole(user.role) : null
  if (!user || !valid || user.disabledAt || !role || (ownerOnly && role !== "owner")) {
    return { ok: false as const, error: "Неверная почта или пароль." }
  }

  if (!await createSession(user.id, user.passwordHash)) return { ok: false as const, error: "Неверная почта или пароль." }
  return {
    ok: true as const,
    role,
  }
}

export async function loginOwner(email: string, password: string) {
  return loginUser(email, password, true)
}

export async function logoutSession() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (token) {
    await db
      .update(sessions)
      .set({ revokedAt: nowIso() })
      .where(eq(sessions.tokenHash, hashToken(token)))
      .run()
  }
  jar.delete(COOKIE)
}

export async function logoutOwner() {
  await logoutSession()
}

export async function revokeUserSessions(userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: nowIso() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
    .run()
}

export async function disableManager(userId: string) {
  migrate()
  sqlite.transaction(() => {
    const user = db.select().from(users).where(eq(users.id, userId)).get()
    if (!user || user.role !== "manager") return
    const now = nowIso()
    db.update(users).set({ disabledAt: now }).where(eq(users.id, userId)).run()
    db.update(sessions).set({ revokedAt: now }).where(eq(sessions.userId, userId)).run()
  }).immediate()
}

export const SESSION_COOKIE = COOKIE
