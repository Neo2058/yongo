import "server-only"

import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export function nowIso() {
  return new Date().toISOString()
}

export function newId() {
  return crypto.randomUUID()
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt.toString("hex")}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":")
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const hash = Buffer.from(hashHex, "hex")
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  if (derived.length !== hash.length) return false
  return timingSafeEqual(hash, derived)
}

export function randomToken() {
  return randomBytes(32).toString("base64url")
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
}

export function slugify(value: string) {
  const translit = value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC[char] ?? char)
    .join("")
  return translit
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
}
