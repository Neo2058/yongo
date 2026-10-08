import { mkdirSync } from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"

const root = process.cwd()
const source = path.join(root, "data", "yongo.sqlite")
const dir = path.join(root, "data", "backups")
mkdirSync(dir, { recursive: true })

const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const destination = path.join(dir, `yongo-${stamp}.sqlite`)

const db = new Database(source, { readonly: true, fileMustExist: true })
try {
  await db.backup(destination)
  console.info(`[backup] ${destination}`)
} finally {
  db.close()
}
