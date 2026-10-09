import "server-only"

import { mkdirSync } from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "@/data/schema"

const dataDir = path.join(process.cwd(), "data")
mkdirSync(dataDir, { recursive: true })

export const sqlite = new Database(path.join(dataDir, "yongo.sqlite"))
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")
sqlite.pragma("busy_timeout = 5000")

export const db = drizzle(sqlite, { schema })
