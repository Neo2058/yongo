import Database from 'better-sqlite3'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedServices } from '../src/content/services.ts'
import { seedPages } from '../src/content/pages.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dbPath = process.env.YONGO_CONTENT_DB || path.join(root, 'data', 'yongo.sqlite')
const apply = process.argv.includes('--apply')
if (!existsSync(dbPath)) {
  console.log('База ещё не создана. Новая установка получит обновлённые тексты автоматически.')
  process.exit(0)
}
const db = new Database(dbPath, { readonly: !apply, fileMustExist: true })
const legacy = JSON.parse(readFileSync(new URL('./previous-public-defaults.json', import.meta.url), 'utf8'))
const plan = []
let preserved = 0
for (const [group, next, channel, type] of [
  [legacy.services, seedServices, 'shop', 'service'],
  [legacy.pages, seedPages, 'public', 'page'],
]) {
  for (const old of group) {
    const row = db.prepare('SELECT * FROM contents WHERE slug = ?').get(old.slug)
    if (!row) continue
    const original = row.channel === channel && row.type === type && row.status === 'published'
      && ['title', 'excerpt', 'body'].every((key) => row[key] === old[key])
      && (row.cover || '') === old.cover && (row.cover_alt || '') === old.coverAlt
      && (row.kicker || '') === old.kicker && Boolean(row.featured) === Boolean(old.featured)
      && row.tags_json === JSON.stringify(old.tags)
    if (!original) { preserved++; continue }
    const replacement = next.find((item) => item.slug === old.slug)
    plan.push({ id: row.id, slug: row.slug, replacement })
  }
}
console.log(`Обновить: ${plan.filter((item) => item.replacement).length}; архивировать: ${plan.filter((item) => !item.replacement).length}; сохранить изменённые записи: ${preserved}.`)
for (const item of plan) console.log(`${item.replacement ? 'UPDATE' : 'ARCHIVE'} ${item.slug}`)
if (apply && plan.length) {
  const backupDir = path.join(path.dirname(dbPath), 'backups')
  mkdirSync(backupDir, { recursive: true })
  const backup = path.join(backupDir, `before-portfolio-${Date.now()}.sqlite`)
  await db.backup(backup)
  db.transaction(() => {
    const update = db.prepare('UPDATE contents SET title=?, excerpt=?, body=?, cover=?, cover_alt=?, kicker=?, tags_json=?, featured=?, updated_at=? WHERE id=?')
    const archive = db.prepare("UPDATE contents SET status='archived', updated_at=? WHERE id=?")
    const now = new Date().toISOString()
    for (const { id, replacement: item } of plan) {
      if (item) update.run(item.title, item.excerpt, item.body, item.cover, item.coverAlt, item.kicker, JSON.stringify(item.tags), Number(Boolean(item.featured)), now, id)
      else archive.run(now, id)
    }
  })()
  console.log(`Готово. Резервная копия: ${backup}`)
} else if (!apply && plan.length) {
  console.log('Проверка без изменений. Для применения добавьте --apply.')
}
db.close()
