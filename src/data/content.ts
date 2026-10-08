import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db } from "@/data/db"
import { contents } from "@/data/schema"
import { newId, nowIso, slugify } from "@/data/crypto"
import { requireBriefingUser, requireOwner } from "@/data/auth"
import { posts as seedPosts, type PostBlock } from "@/content/blog"
import { seedPages } from "@/content/pages"
import { seedServices } from "@/content/services"
import { migrate } from "@/data/migrate"

export type ContentChannel = "public" | "internal" | "shop"
export type ContentStatus = "draft" | "published" | "archived"
export type ContentType = "article" | "case" | "service" | "briefing" | "page"
export type SitePageSlug = (typeof seedPages)[number]["slug"]

export const SITE_PAGE_SLUGS: SitePageSlug[] = seedPages.map((page) => page.slug)

export function isSitePageSlug(value: string): value is SitePageSlug {
  return SITE_PAGE_SLUGS.includes(value as SitePageSlug)
}

export type ContentDTO = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  cover: string
  coverAlt: string
  channel: ContentChannel
  type: ContentType
  status: ContentStatus
  featured: boolean
  kicker: string
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  reading: string
}

function blocksToMarkdown(blocks: PostBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `## ${block.text}`
      if (block.type === "ul") return block.items.map((item) => `- ${item}`).join("\n")
      return block.text
    })
    .join("\n\n")
}

function readingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 180))} мин`
}

function parseTags(json: string) {
  try {
    const value = JSON.parse(json) as unknown
    return Array.isArray(value) ? value.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

function toDTO(row: typeof contents.$inferSelect): ContentDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    cover: row.cover ?? "",
    coverAlt: row.coverAlt ?? "",
    channel: row.channel as ContentChannel,
    type: row.type as ContentType,
    status: row.status as ContentStatus,
    featured: Boolean(row.featured),
    kicker: row.kicker ?? "",
    tags: parseTags(row.tagsJson),
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    reading: readingTime(row.body),
  }
}

export async function seedPublishedPosts() {
  migrate()
  const existing = await db.select({ id: contents.id }).from(contents).limit(1).get()
  if (existing) return

  const now = nowIso()
  for (const post of seedPosts) {
    await db.insert(contents)
      .values({
        id: newId(),
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: blocksToMarkdown(post.body),
        cover: post.cover,
        coverAlt: post.coverAlt,
        channel: "public",
        type: "article",
        status: "published",
        featured: Boolean(post.featured),
        kicker: post.kicker ?? null,
        tagsJson: JSON.stringify(post.tags),
        publishedAt: `${post.publishedAt}T12:00:00.000Z`,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: contents.slug })
      .run()
  }
}

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = slugify(base) || "zapis"
  if (isSitePageSlug(slug)) slug = `${slug}-zapis`
  let i = 2
  while (true) {
    const found = await db.select().from(contents).where(eq(contents.slug, slug)).get()
    if ((!found || found.id === ignoreId) && !isSitePageSlug(slug)) return slug
    slug = `${slugify(base)}-${i}`
    if (isSitePageSlug(slug)) slug = `${slug}-zapis`
    i += 1
  }
}

export async function listPublishedPublicPosts() {
  await seedPublishedPosts()
  const rows = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.channel, "public"),
        eq(contents.status, "published"),
        eq(contents.type, "article"),
      ),
    )
    .orderBy(desc(contents.publishedAt))
    .all()
  return rows.map(toDTO)
}

export async function getPublishedPublicPost(slug: string) {
  await seedPublishedPosts()
  const row = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.slug, slug),
        eq(contents.channel, "public"),
        eq(contents.status, "published"),
        eq(contents.type, "article"),
      ),
    )
    .get()
  return row ? toDTO(row) : null
}

export async function listFeaturedPublicPosts() {
  return (await listPublishedPublicPosts()).filter((post) => post.featured).slice(0, 3)
}

export async function seedShopServices() {
  migrate()
  const existing = await db
    .select({ id: contents.id })
    .from(contents)
    .where(eq(contents.channel, "shop"))
    .limit(1)
    .get()
  if (existing) return

  const now = nowIso()
  for (const service of seedServices) {
    await db
      .insert(contents)
      .values({
        id: newId(),
        slug: service.slug,
        title: service.title,
        excerpt: service.excerpt,
        body: service.body,
        cover: service.cover,
        coverAlt: service.coverAlt,
        channel: "shop",
        type: "service",
        status: "published",
        featured: Boolean(service.featured),
        kicker: service.kicker,
        tagsJson: JSON.stringify([...service.tags]),
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: contents.slug })
      .run()
  }
}

export async function listPublishedShopServices() {
  await seedShopServices()
  const rows = await db
    .select()
    .from(contents)
    .where(and(eq(contents.channel, "shop"), eq(contents.status, "published")))
    .orderBy(desc(contents.featured), desc(contents.publishedAt))
    .all()
  return rows.map(toDTO)
}

export async function getPublishedShopService(slug: string) {
  await seedShopServices()
  const row = await db
    .select()
    .from(contents)
    .where(
      and(eq(contents.slug, slug), eq(contents.channel, "shop"), eq(contents.status, "published")),
    )
    .get()
  return row ? toDTO(row) : null
}

export async function listFeaturedShopServices() {
  return (await listPublishedShopServices()).filter((item) => item.featured).slice(0, 4)
}

export async function seedSitePages() {
  migrate()
  const now = nowIso()
  for (const page of seedPages) {
    const existing = await db.select({ id: contents.id }).from(contents).where(eq(contents.slug, page.slug)).get()
    if (existing) continue
    await db
      .insert(contents)
      .values({
        id: newId(),
        slug: page.slug,
        title: page.title,
        excerpt: page.excerpt,
        body: page.body,
        cover: page.cover,
        coverAlt: page.coverAlt,
        channel: "public",
        type: "page",
        status: "published",
        featured: false,
        kicker: page.kicker,
        tagsJson: JSON.stringify([...page.tags]),
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: contents.slug })
      .run()
  }
}

export async function getPublishedSitePage(slug: SitePageSlug) {
  await seedSitePages()
  const row = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.slug, slug),
        eq(contents.channel, "public"),
        eq(contents.type, "page"),
        eq(contents.status, "published"),
      ),
    )
    .get()
  return row ? toDTO(row) : null
}

export async function getSitePageForOwner(slug: string) {
  const owner = await requireOwner()
  if (!owner || !isSitePageSlug(slug)) return null
  await seedSitePages()
  const row = await db
    .select()
    .from(contents)
    .where(and(eq(contents.slug, slug), eq(contents.type, "page")))
    .get()
  return row ? toDTO(row) : null
}

export async function listSitePagesForOwner() {
  const owner = await requireOwner()
  if (!owner) return []
  await seedSitePages()
  const rows = await db.select().from(contents).where(eq(contents.type, "page")).all()
  const order = new Map(SITE_PAGE_SLUGS.map((slug, index) => [slug, index]))
  return rows
    .map(toDTO)
    .sort((a, b) => (order.get(a.slug as SitePageSlug) ?? 99) - (order.get(b.slug as SitePageSlug) ?? 99))
}

export async function listPublishedBriefingPosts() {
  const user = await requireBriefingUser()
  if (!user) return []
  const rows = await db
    .select()
    .from(contents)
    .where(and(eq(contents.channel, "internal"), eq(contents.status, "published")))
    .orderBy(desc(contents.publishedAt))
    .all()
  return rows.map(toDTO)
}

export async function getPublishedBriefingPost(slug: string) {
  const user = await requireBriefingUser()
  if (!user) return null
  const row = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.slug, slug),
        eq(contents.channel, "internal"),
        eq(contents.status, "published"),
      ),
    )
    .get()
  return row ? toDTO(row) : null
}

export async function listContentsForOwner(channel?: ContentChannel, type?: ContentType) {
  const owner = await requireOwner()
  if (!owner) return []
  await seedPublishedPosts()
  await seedShopServices()
  await seedSitePages()
  const filters = [
    ...(channel ? [eq(contents.channel, channel)] : []),
    ...(type ? [eq(contents.type, type)] : []),
  ]
  const rows = filters.length
    ? await db
        .select()
        .from(contents)
        .where(filters.length === 1 ? filters[0] : and(...filters))
        .orderBy(desc(contents.updatedAt))
        .all()
    : await db.select().from(contents).orderBy(desc(contents.updatedAt)).all()
  return rows.map(toDTO)
}

export async function getContentForOwner(id: string) {
  const owner = await requireOwner()
  if (!owner) return null
  const row = await db.select().from(contents).where(eq(contents.id, id)).get()
  return row ? toDTO(row) : null
}

export type ContentInput = {
  title: string
  slug?: string
  excerpt: string
  body: string
  cover?: string
  coverAlt?: string
  channel: ContentChannel
  type: ContentType
  status: ContentStatus
  featured: boolean
  kicker?: string
  tags: string[]
}

export async function saveContent(input: ContentInput, id?: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }

  const title = input.title.trim()
  if (title.length < 3) return { ok: false as const, error: "Заголовок слишком короткий." }
  const excerpt = input.excerpt.trim()
  const body = input.body.trim()
  if (!body) return { ok: false as const, error: "Текст статьи пустой." }

  const now = nowIso()
  const current = id ? await db.select().from(contents).where(eq(contents.id, id)).get() : undefined
  if (id && !current) return { ok: false as const, error: "Запись не найдена." }

  const isPage = current?.type === "page" || input.type === "page"
  if (isPage) {
    const pageSlug = current?.slug ?? input.slug ?? ""
    if (!isSitePageSlug(pageSlug)) {
      return { ok: false as const, error: "Страницы сайта — только /work и /about." }
    }
    if (current && current.type === "page" && input.type !== "page") {
      return { ok: false as const, error: "Тип страницы сайта менять нельзя." }
    }
  }

  const slug = isPage
    ? (current?.slug ?? input.slug ?? "")
    : await uniqueSlug(input.slug || title, id)
  const publishedAt = input.status === "published" ? (current?.publishedAt ?? now) : null

  if (id && current) {
    await db.update(contents)
      .set({
        slug,
        title,
        excerpt,
        body,
        cover: input.cover || null,
        coverAlt: input.coverAlt || null,
        channel: isPage ? "public" : input.channel,
        type: isPage ? "page" : input.type,
        status: input.status,
        featured: isPage ? false : input.featured,
        kicker: input.kicker || null,
        tagsJson: JSON.stringify(input.tags),
        publishedAt: input.status === "published" ? (current.publishedAt ?? now) : null,
        updatedAt: now,
      })
      .where(eq(contents.id, id))
      .run()
    return { ok: true as const, id }
  }

  const createdId = newId()
  await db.insert(contents)
    .values({
      id: createdId,
      slug,
      title,
      excerpt,
      body,
      cover: input.cover || null,
      coverAlt: input.coverAlt || null,
      channel: isPage ? "public" : input.channel,
      type: isPage ? "page" : input.type,
      status: input.status,
      featured: isPage ? false : input.featured,
      kicker: input.kicker || null,
      tagsJson: JSON.stringify(input.tags),
      publishedAt,
      createdAt: now,
      updatedAt: now,
    })
    .run()
  return { ok: true as const, id: createdId }
}

export async function deleteContent(id: string) {
  const owner = await requireOwner()
  if (!owner) return { ok: false as const, error: "Нет доступа." }
  const row = await db.select().from(contents).where(eq(contents.id, id)).get()
  if (!row) return { ok: false as const, error: "Запись не найдена." }
  if (row.type === "page" || isSitePageSlug(row.slug)) {
    return { ok: false as const, error: "Страницы /work и /about удалять нельзя." }
  }
  await db.delete(contents).where(eq(contents.id, id)).run()
  return { ok: true as const }
}
