import "server-only"

import { sqlite } from "@/data/db"

let migrated = false

const statements = [
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key_hash TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(reset_at)`,
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    last_seen_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    cover TEXT,
    cover_alt TEXT,
    channel TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    kicker TEXT,
    tags_json TEXT NOT NULL DEFAULT '[]',
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS media_files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    visibility TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS invites (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    revoked_at TEXT,
    created_user_id TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    service_slug TEXT,
    service_title TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
]

function hasColumn(table: string, column: string) {
  const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  return rows.some((row) => row.name === column)
}

export function migrate() {
  if (migrated) return
  sqlite.exec("BEGIN IMMEDIATE")
  try {
    for (const sql of statements) sqlite.exec(sql)
    if (!hasColumn("users", "name")) {
      sqlite.exec(`ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''`)
    }
    if (!hasColumn("users", "disabled_at")) {
      sqlite.exec(`ALTER TABLE users ADD COLUMN disabled_at TEXT`)
    }
    // Bound legacy unused links once; never extend their lifetime on requests.
    const expiryMigration = "2026-10-08-invite-expiry"
    if (!sqlite.prepare("SELECT id FROM schema_migrations WHERE id = ?").get(expiryMigration)) {
      const legacyDeadline = new Date(Date.now() + 7 * 86400000).toISOString()
      sqlite.prepare(`UPDATE invites SET expires_at = ?
        WHERE used_at IS NULL AND revoked_at IS NULL AND expires_at > ?`)
        .run(legacyDeadline, legacyDeadline)
      sqlite.prepare("INSERT INTO schema_migrations VALUES (?, ?)").run(expiryMigration, new Date().toISOString())
    }
    sqlite.exec("COMMIT")
    migrated = true
  } catch (error) {
    sqlite.exec("ROLLBACK")
    throw error
  }
}
