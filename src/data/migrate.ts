import "server-only"

import { sqlite } from "@/data/db"

const statements = [
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
]

export function migrate() {
  sqlite.exec("BEGIN")
  try {
    for (const sql of statements) sqlite.exec(sql)
    sqlite.exec("COMMIT")
  } catch (error) {
    sqlite.exec("ROLLBACK")
    throw error
  }
}
