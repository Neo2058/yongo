import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

process.umask(0o077)
const root = process.cwd()
const source = path.join(root, "data", "yongo.sqlite")
const dir = path.resolve(process.env.BACKUP_DIR || path.join(root, "data", "backups"))
const keep = Number(process.env.BACKUP_KEEP || 7)
if (!Number.isInteger(keep) || keep < 1) throw new Error("BACKUP_KEEP must be a positive integer")
mkdirSync(dir, { recursive: true, mode: 0o700 })
const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const destination = path.join(dir, stamp)
mkdirSync(destination, { mode: 0o700 })

function rejectSymlinks(location) {
  if (lstatSync(location).isSymbolicLink()) throw new Error("Backup refuses symbolic links in storage")
  if (lstatSync(location).isDirectory()) {
    for (const entry of readdirSync(location)) rejectSymlinks(path.join(location, entry))
  }
}

const db = new Database(source, { readonly: true, fileMustExist: true })
try {
  await db.backup(path.join(destination, "yongo.sqlite"))
  const storage = path.join(root, "storage")
  if (existsSync(storage)) {
    rejectSymlinks(storage)
    cpSync(storage, path.join(destination, "storage"), { recursive: true, errorOnExist: true, force: false })
  } else {
    mkdirSync(path.join(destination, "storage"))
  }
  const check = new Database(path.join(destination, "yongo.sqlite"), { readonly: true })
  try {
    if (check.pragma("quick_check", { simple: true }) !== "ok") throw new Error("Backup integrity check failed")
  } finally { check.close() }
  writeFileSync(path.join(destination, "manifest.json"), JSON.stringify({
    format: "yongo-backup-v1", createdAt: new Date().toISOString(), database: "yongo.sqlite", storage: "storage",
  }, null, 2))
  // Rotate only complete snapshots created by this script, never legacy or unknown files.
  const snapshots = readdirSync(dir).filter((entry) => {
    if (!/^\d{4}-\d{2}-\d{2}T[\d-]+Z$/.test(entry)) return false
    const candidate = path.join(dir, entry)
    if (lstatSync(candidate).isSymbolicLink() || !existsSync(path.join(candidate, "manifest.json"))) return false
    try { return JSON.parse(readFileSync(path.join(candidate, "manifest.json"), "utf8")).format === "yongo-backup-v1" }
    catch { return false }
  }).sort().reverse()
  for (const obsolete of snapshots.slice(keep)) rmSync(path.join(dir, obsolete), { recursive: true })
  console.info(`[backup] Complete snapshot: ${destination}`)
} finally {
  db.close()
}
