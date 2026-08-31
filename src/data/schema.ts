import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull(),
})

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  revokedAt: text("revoked_at"),
  lastSeenAt: text("last_seen_at").notNull(),
})

export const contents = sqliteTable("contents", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  cover: text("cover"),
  coverAlt: text("cover_alt"),
  channel: text("channel").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  kicker: text("kicker"),
  tagsJson: text("tags_json").notNull().default("[]"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  source: text("source").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
})

export const mediaFiles = sqliteTable("media_files", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull().unique(),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  visibility: text("visibility").notNull(),
  createdAt: text("created_at").notNull(),
})
