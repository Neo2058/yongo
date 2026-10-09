import { mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { randomBytes, scrypt } from "node:crypto"
import { promisify } from "node:util"
import Database from "better-sqlite3"

process.umask(0o077)
const email = process.argv[2]?.trim().toLowerCase()
if (!email) throw new Error("Usage: yarn owner:password owner@example.com (password read from stdin)")

async function readPassword() {
  if (!process.stdin.isTTY) return readFileSync(0, "utf8").replace(/\r?\n$/, "")
  process.stdout.write("New password (12–256 characters, hidden): ")
  return new Promise((resolve, reject) => {
    let value = ""
    process.stdin.setRawMode(true)
    process.stdin.setEncoding("utf8")
    process.stdin.resume()
    const done = () => {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.off("data", input)
      process.stdout.write("\n")
    }
    const input = (chunk) => {
      for (const char of chunk) {
        if (char === "\u0003") { done(); reject(new Error("Cancelled")); return }
        if (char === "\r" || char === "\n") { done(); resolve(value); return }
        if (char === "\u007f" || char === "\b") value = [...value].slice(0, -1).join("")
        else if (char >= " ") value += char
      }
    }
    process.stdin.on("data", input)
  })
}

const password = await readPassword()
if (password.length < 12 || password.length > 256 || password === "change-me-at-least-10") {
  throw new Error("Use a unique password of 12–256 characters")
}
const salt = randomBytes(16)
const derived = await promisify(scrypt)(password, salt, 64)
const passwordHash = `${salt.toString("hex")}:${derived.toString("hex")}`
const db = new Database(path.join(process.cwd(), "data", "yongo.sqlite"), { fileMustExist: true })
db.pragma("busy_timeout = 5000")
try {
  const user = db.prepare("SELECT id FROM users WHERE email = ? AND role = 'owner' AND disabled_at IS NULL").get(email)
  if (!user) throw new Error("Active owner not found; no changes made")
  const dir = path.join(process.cwd(), "data", "backups")
  mkdirSync(dir, { recursive: true, mode: 0o700 })
  await db.backup(path.join(dir, `before-password-reset-${Date.now()}.sqlite`))
  db.transaction(() => {
    const changed = db.prepare("UPDATE users SET password_hash = ? WHERE id = ? AND role = 'owner' AND disabled_at IS NULL")
      .run(passwordHash, user.id)
    if (changed.changes !== 1) throw new Error("Owner changed during reset; transaction cancelled")
    db.prepare("UPDATE sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL")
      .run(new Date().toISOString(), user.id)
  }).immediate()
  console.info("Owner password updated; all previous sessions revoked. Update/remove bootstrap secrets separately.")
} finally { db.close() }
