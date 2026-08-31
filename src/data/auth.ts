import "server-only"

import { and, eq, isNull } from "drizzle-orm"
import { cache } from "react"
import { cookies, headers } from "next/headers"
import { db } from "@/data/db"
import { hashPassword, hashToken, newId, nowIso, randomToken, verifyPassword } from "@/data/crypto"
import { migrate } from "@/data/migrate"
import { rateLimit } from "@/data/rate-limit"
import { sessions, users } from "@/data/schema"

const COOKIE = "yongo_session"
const SESSION_DAYS = 14

export type SessionUser = {
  id: string
  email: string
  role: "owner" | "manager"
}

function asRole(value: string): SessionUser["role"] {
  return value === "manager" ? "manager" : "owner"
}

export async function bootstrap() {
  migrate()
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD
  if (!email || !password) return

  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) return

  await db.insert(users).values({
    id: newId(),
    email,
    passwordHash: await hashPassword(password),
    role: "owner",
    createdAt: nowIso(),
  }).run()
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
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt)))
    .get()

  if (!row) return null
  if (new Date(row.expiresAt).getTime() < Date.now()) return null

  await db
    .update(sessions)
    .set({ lastSeenAt: nowIso() })
    .where(eq(sessions.id, row.sessionId))
    .run()

  return { id: row.userId, email: row.email, role: asRole(row.role) }
})

export async function requireOwner() {
  const user = await getSessionUser()
  if (!user || user.role !== "owner") return null
  return user
}

export async function loginOwner(email: string, password: string) {
  await bootstrap()
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  const limited = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
  if (!limited.ok) {
    return { ok: false as const, error: "Слишком много попыток. Подождите 15 минут." }
  }

  const normalized = email.trim().toLowerCase()
  const user = await db.select().from(users).where(eq(users.email, normalized)).get()
  const dummy = "00".repeat(16) + ":" + "00".repeat(64)
  const valid = user ? await verifyPassword(password, user.passwordHash) : await verifyPassword(password, dummy)

  if (!user || user.role !== "owner" || !valid) {
    return { ok: false as const, error: "Неверная почта или пароль." }
  }

  const token = randomToken()
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({
    id: newId(),
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: expires.toISOString(),
    lastSeenAt: nowIso(),
  }).run()

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  })

  return { ok: true as const }
}

export async function logoutOwner() {
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

export const SESSION_COOKIE = COOKIE
