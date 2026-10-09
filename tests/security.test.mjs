import assert from "node:assert/strict"
import { beforeEach, after, test } from "node:test"
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { spawnSync } from "node:child_process"
import { root, hooks } from "./server-loader.mjs"
import { request, context } from "./request-context.mjs"

// Run real DAL + SQLite in a disposable directory. Only request-scoped Next APIs
// and the server-only build marker are substituted; authorization is not mocked.
const originalCwd = process.cwd()
const temporary = mkdtempSync(path.join(tmpdir(), "yongo-security-"))
process.chdir(temporary)
const auth = await import("@/data/auth")
const crypto = await import("@/data/crypto")
const invites = await import("@/data/invites")
const { db, sqlite } = await import("@/data/db")
const schema = await import("@/data/schema")
const { migrate } = await import("@/data/migrate")
const { rateLimit } = await import("@/data/rate-limit")
const { requestIp } = await import("@/data/request-ip")
const { publicSiteUrl } = await import("@/data/site-url")
const content = await import("@/data/content")
const leads = await import("@/data/leads")
const orders = await import("@/data/orders")
const tasks = await import("@/data/tasks")
const publicMedia = await import(pathToFileURL(path.join(root, "src/app/media/public/[filename]/route.ts")))
const internalMedia = await import(pathToFileURL(path.join(root, "src/app/media/internal/[filename]/route.ts")))
const policy = await import("@/data/media-policy")
const { proxy } = await import(pathToFileURL(path.join(root, "src/proxy.ts")))
const { NextRequest } = await import("next/server.js")
const ownerToken = crypto.randomToken()
const managerToken = crypto.randomToken()
const password = "Security-test-password-123!"
const passwordHash = await crypto.hashPassword(password)
migrate()

function addUser(id, role, token, disabledAt = null) {
  db.insert(schema.users).values({ id, email: `${id}@example.test`, name: id, role, passwordHash, disabledAt, createdAt: crypto.nowIso() }).run()
  db.insert(schema.sessions).values({ id: `${id}-session`, userId: id, tokenHash: crypto.hashToken(token), expiresAt: new Date(Date.now() + 86400000).toISOString(), lastSeenAt: crypto.nowIso() }).run()
}
function asOwner(run) { return request({ cookies: [["yongo_session", { value: ownerToken }]] }, run) }
function asManager(run) { return request({ cookies: [["yongo_session", { value: managerToken }]] }, run) }
function addInvite(email = "invited@example.test", extra = {}) {
  const token = crypto.randomToken()
  const id = crypto.newId()
  db.insert(schema.invites).values({ id, email, name: "Manager", tokenHash: crypto.hashToken(token), role: "manager", expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: crypto.nowIso(), ...extra }).run()
  return { token, id }
}
function addContent(channel, status, filename, visibility, id = "test-content") {
  const url = `/media/${visibility}/${filename}`
  db.insert(schema.contents).values({ id, slug: id, title: "Sensitive title", excerpt: "Sensitive excerpt", body: `![image](${url})`, cover: url, channel, type: channel === "internal" ? "briefing" : "article", status, createdAt: crypto.nowIso(), updatedAt: crypto.nowIso() }).run()
}
function addMedia(visibility) {
  const filename = `${crypto.randomToken()}.png`
  mkdirSync(path.join(temporary, "storage", visibility), { recursive: true })
  writeFileSync(path.join(temporary, "storage", visibility, filename), "test media bytes")
  db.insert(schema.mediaFiles).values({ id: crypto.newId(), filename, originalName: "test.png", mime: "image/png", visibility, createdAt: crypto.nowIso() }).run()
  return filename
}
function getMedia(route, filename) { return route.GET(new Request("https://example.test"), { params: Promise.resolve({ filename }) }) }

beforeEach(() => {
  for (const table of ["sessions", "invites", "users", "contents", "media_files", "tasks", "leads", "orders", "rate_limits"]) sqlite.exec(`DELETE FROM ${table}`)
  process.env.NODE_ENV = "test"
  process.env.SITE_URL = "https://example.test"
  process.env.TRUST_PROXY = "0"
  process.env.OWNER_EMAIL = "bootstrap@example.test"
  process.env.OWNER_PASSWORD = password
  addUser("owner", "owner", ownerToken)
  addUser("manager", "manager", managerToken)
})
after(() => {
  sqlite.close()
  hooks.deregister()
  process.chdir(originalCwd)
  rmSync(temporary, { recursive: true, force: true })
})

test("anonymous and manager cannot read or mutate owner data", async () => {
  for (const run of [(fn) => request({}, fn), asManager]) {
    await run(async () => {
      assert.equal(await auth.requireOwner(), null)
      assert.deepEqual(await content.listContentsForOwner(), [])
      assert.deepEqual(await leads.listLeadsForOwner(), [])
      assert.deepEqual(await orders.listOrdersForOwner(), [])
      assert.deepEqual(await tasks.listTasksForOwner(), [])
      assert.equal((await content.saveContent({ title: "Attack" })).ok, false)
      assert.equal((await invites.createInvite("Attack", "attack@example.test")).ok, false)
    })
  }
})
test("unknown roles and invalid session expiry fail closed", async () => {
  sqlite.prepare("UPDATE users SET role = 'unexpected' WHERE id = 'manager'").run()
  assert.equal(await asManager(auth.getSessionUser), null)
  sqlite.prepare("UPDATE sessions SET expires_at = 'invalid' WHERE user_id = 'owner'").run()
  assert.equal(await asOwner(auth.getSessionUser), null)
})
test("bootstrap ignores changed env when users exist; concurrent empty bootstrap creates one owner", async () => {
  await auth.bootstrap()
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users WHERE email = 'bootstrap@example.test'").get().n, 0)
  sqlite.exec("DELETE FROM sessions; DELETE FROM users")
  await Promise.all([auth.bootstrap(), auth.bootstrap()])
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 1)
})
test("weak first-install password fails initialization", async () => {
  sqlite.exec("DELETE FROM sessions; DELETE FROM users")
  process.env.OWNER_PASSWORD = "change-me-at-least-10"
  await assert.rejects(auth.bootstrap)
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users").get().n, 0)
})
test("manager login to owner endpoint never creates a session", async () => {
  await request({}, async () => {
    const result = await auth.loginOwner("manager@example.test", password)
    assert.equal(result.ok, false)
    assert.equal(context.getStore().cookies.size, 0)
  })
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM sessions").get().n, 2)
})
test("revoke during invite password hashing cannot restore disabled manager", async () => {
  sqlite.prepare("UPDATE users SET disabled_at = ? WHERE id = 'manager'").run(crypto.nowIso())
  const invite = addInvite("manager@example.test")
  const accepting = request({}, () => invites.acceptInvite(invite.token, password))
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal((await asOwner(() => invites.revokeInvite(invite.id))).ok, true)
  assert.equal((await accepting).ok, false)
  assert.ok(sqlite.prepare("SELECT disabled_at FROM users WHERE id = 'manager'").get().disabled_at)
})
test("simultaneous accepts consume an invite only once", async () => {
  const invite = addInvite()
  const results = await Promise.all([request({}, () => invites.acceptInvite(invite.token, password)), request({}, () => invites.acceptInvite(invite.token, password))])
  assert.equal(results.filter((result) => result.ok).length, 1)
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM users WHERE email = 'invited@example.test'").get().n, 1)
})
test("expired, used and revoked invites are unavailable", async () => {
  for (const extra of [{ expiresAt: new Date(Date.now() - 1000).toISOString() }, { usedAt: crypto.nowIso() }, { revokedAt: crypto.nowIso() }]) {
    const { token } = addInvite(crypto.randomToken() + "@example.test", extra)
    assert.equal(await invites.getPendingInvite(token), null)
    assert.equal((await request({}, () => invites.acceptInvite(token, password))).ok, false)
  }
})
test("access revoke disables account, invalidates sessions and blocks further login", async () => {
  const { id } = addInvite("manager@example.test", { usedAt: crypto.nowIso(), createdUserId: "manager" })
  await asOwner(() => invites.revokeInvite(id))
  assert.equal(await asManager(auth.getSessionUser), null)
  assert.equal((await request({}, () => auth.loginUser("manager@example.test", password))).ok, false)
  assert.equal(await request({}, () => auth.createSession("manager")), false)
})
test("IP headers are ignored unless explicitly trusted and valid", () => {
  const spoofed = new Headers({ "x-forwarded-for": "203.0.113.55", "x-real-ip": "203.0.113.56" })
  assert.equal(requestIp(spoofed), "unknown")
  process.env.TRUST_PROXY = "1"
  assert.equal(requestIp(spoofed), "203.0.113.56")
  assert.equal(requestIp(new Headers({ "x-real-ip": "203.0.113.56, 127.0.0.1" })), "unknown")
})
test("rate limits persist, expire, hash identifiers and cap storage", () => {
  assert.equal(rateLimit("login:private@example.test", 1, 60000).ok, true)
  assert.equal(rateLimit("login:private@example.test", 1, 60000).ok, false)
  assert.equal(sqlite.prepare("SELECT key_hash FROM rate_limits").get().key_hash.includes("private"), false)
  sqlite.prepare("UPDATE rate_limits SET reset_at = 0").run()
  assert.equal(rateLimit("login:private@example.test", 1, 60000).ok, true)
  sqlite.transaction(() => { for (let i = 1; i < 10000; i++) sqlite.prepare("INSERT INTO rate_limits VALUES (?, 1, ?)").run(`test-${i}`, Date.now() + 60000) })()
  assert.equal(rateLimit("new-key", 1, 60000).ok, false)
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM rate_limits").get().n, 10000)
})
test("public uploads require published content and are unavailable after unpublishing", async () => {
  const filename = addMedia("public")
  addContent("public", "draft", filename, "public")
  assert.equal((await request({}, () => getMedia(publicMedia, filename))).status, 404)
  assert.equal((await asOwner(() => getMedia(publicMedia, filename))).status, 200)
  sqlite.prepare("UPDATE contents SET status = 'published'").run()
  const response = await request({}, () => getMedia(publicMedia, filename))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
  sqlite.prepare("UPDATE contents SET status = 'archived'").run()
  assert.equal((await request({}, () => getMedia(publicMedia, filename))).status, 404)
})
test("internal media needs authorization and publication for managers", async () => {
  const filename = addMedia("internal")
  addContent("internal", "draft", filename, "internal")
  assert.equal((await request({}, () => getMedia(internalMedia, filename))).status, 404)
  assert.equal((await asManager(() => getMedia(internalMedia, filename))).status, 404)
  assert.equal((await asOwner(() => getMedia(internalMedia, filename))).status, 200)
  sqlite.prepare("UPDATE contents SET status = 'published'").run()
  const response = await asManager(() => getMedia(internalMedia, filename))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
})
test("media cannot cross content channels or be served via traversal", async () => {
  const filename = addMedia("public")
  assert.ok(policy.validateContentMedia(`/media/public/${filename}`, "text", "internal"))
  assert.ok(policy.validateContentMedia("https://tracker.example/image.png", "text", "public"))
  assert.equal((await asOwner(() => getMedia(publicMedia, "../secret"))).status, 404)
  assert.equal((await request({}, () => getMedia(publicMedia, filename.replace(".png", "x.png")))).status, 404)
})
test("closed headers apply to prefetches and paths ending in image extensions", () => {
  for (const pathname of ["/briefing/secret.png", "/i/secret", "/media/internal/file.png"]) {
    const response = proxy(new NextRequest(`https://example.test${pathname}`, { headers: { purpose: "prefetch" } }))
    assert.equal(response.headers.get("Cache-Control"), "private, no-store")
    assert.equal(response.headers.get("Referrer-Policy"), "no-referrer")
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow")
  }
})
test("production links require configured HTTPS origin", () => {
  process.env.NODE_ENV = "production"
  process.env.SITE_URL = "http://localhost:3000"
  assert.throws(publicSiteUrl)
  process.env.SITE_URL = "https://example.test/path"
  assert.throws(publicSiteUrl)
  process.env.SITE_URL = "https://example.test"
  assert.equal(publicSiteUrl(), "https://example.test")
})
test("backup includes media, verifies DB and rotates only completed snapshots", () => {
  const filename = addMedia("internal")
  const destination = path.join(temporary, "snapshots")
  mkdirSync(destination)
  writeFileSync(path.join(destination, "keep-me.txt"), "unknown artifact")
  for (let i = 0; i < 2; i++) {
    const result = spawnSync(process.execPath, [path.join(root, "scripts/backup-sqlite.mjs")], { cwd: temporary, env: { ...process.env, BACKUP_DIR: destination, BACKUP_KEEP: "1" }, encoding: "utf8" })
    assert.equal(result.status, 0, result.stderr)
  }
  assert.equal(readdirSync(destination).length, 2)
  const snapshot = readdirSync(destination).find((entry) => entry !== "keep-me.txt")
  assert.ok(existsSync(path.join(destination, snapshot, "storage/internal", filename)))
  assert.equal(JSON.parse(readFileSync(path.join(destination, snapshot, "manifest.json"))).format, "yongo-backup-v1")
})
test("password reset revokes sessions without printing password", async () => {
  const updated = "Updated-security-password-456!"
  const result = spawnSync(process.execPath, [path.join(root, "scripts/owner-password.mjs"), "owner@example.test"], { cwd: temporary, input: updated + "\n", encoding: "utf8" })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout.includes(updated), false)
  assert.equal(await asOwner(auth.getSessionUser), null)
  const row = sqlite.prepare("SELECT password_hash FROM users WHERE id = 'owner'").get()
  assert.equal(await crypto.verifyPassword(updated, row.password_hash), true)
})

test("password reset during password verification cannot create a session with old credentials", async () => {
  const replacement = await crypto.hashPassword("Replacement-security-password!")
  const pending = request({}, () => auth.loginOwner("owner@example.test", password))
  await new Promise((resolve) => setImmediate(resolve))
  sqlite.prepare("UPDATE users SET password_hash = ? WHERE id = 'owner'").run(replacement)
  assert.equal((await pending).ok, false)
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM sessions").get().n, 2)
})
test("repeating revoke of an old invite does not disable renewed access", async () => {
  const { id } = addInvite("manager@example.test", { usedAt: crypto.nowIso(), createdUserId: "manager" })
  await asOwner(() => invites.revokeInvite(id))
  const renewed = addInvite("manager@example.test")
  assert.equal((await request({}, () => invites.acceptInvite(renewed.token, password))).ok, true)
  await asOwner(() => invites.revokeInvite(id))
  assert.equal(sqlite.prepare("SELECT disabled_at FROM users WHERE id = 'manager'").get().disabled_at, null)
})
test("new invite has bounded TTL and active access remains independent of link expiry", async () => {
  const result = await asOwner(() => invites.createInvite("New manager", "new@example.test"))
  assert.equal(result.ok, true)
  const row = sqlite.prepare("SELECT * FROM invites WHERE email = 'new@example.test'").get()
  assert.ok(Date.parse(row.expires_at) > Date.now() + 6 * 86400000)
  assert.ok(Date.parse(row.expires_at) <= Date.now() + 7 * 86400000)
  assert.equal((await asOwner(() => invites.createInvite("New manager", "new@example.test"))).ok, false)
  const active = addInvite("manager@example.test", { usedAt: crypto.nowIso(), createdUserId: "manager", expiresAt: "2000-01-01T00:00:00.000Z" })
  assert.ok(await asManager(auth.requireBriefingUser))
  const rows = await asOwner(invites.listInvitesForOwner)
  assert.equal(rows.find((invite) => invite.id === active.id).status, "active")
})
test("rate limits survive a fresh Node process", () => {
  rateLimit("restart-check", 1, 60000)
  const result = spawnSync(process.execPath, ["--import", path.join(root, "tests/server-loader.mjs"), "--input-type=module", "-e", `
    const { rateLimit } = await import("@/data/rate-limit");
    const { sqlite } = await import("@/data/db");
    console.log(JSON.stringify(rateLimit("restart-check", 1, 60000)));
    sqlite.close();
  `], { cwd: temporary, encoding: "utf8" })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).ok, false)
})
test("legacy unused invite expiry migrates once without extending expired or active access", () => {
  const location = mkdtempSync(path.join(temporary, "legacy-"))
  const setup = `
    const { sqlite } = await import("@/data/db");
    sqlite.exec("CREATE TABLE invites (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE, name TEXT, email TEXT, role TEXT, expires_at TEXT, used_at TEXT, revoked_at TEXT, created_user_id TEXT, created_at TEXT)");
    const insert = sqlite.prepare("INSERT INTO invites VALUES (?, ?, 'Name', 'test@example.test', 'manager', ?, ?, NULL, NULL, '2020-01-01')");
    insert.run("pending", "hash-1", "9999-12-31T00:00:00.000Z", null);
    insert.run("expired", "hash-2", "2000-01-01T00:00:00.000Z", null);
    insert.run("active", "hash-3", "9999-12-31T00:00:00.000Z", "2020-01-01");
  `
  const check = `
    const { sqlite } = await import("@/data/db");
    const { migrate } = await import("@/data/migrate");
    migrate();
    console.log(JSON.stringify(sqlite.prepare("SELECT id, expires_at FROM invites ORDER BY id").all()));
    sqlite.close();
  `
  const execute = (source) => {
    const result = spawnSync(process.execPath, ["--import", path.join(root, "tests/server-loader.mjs"), "--input-type=module", "-e", source], { cwd: location, encoding: "utf8" })
    assert.equal(result.status, 0, result.stderr)
    return JSON.parse(result.stdout)
  }
  const first = execute(setup + check.replace('const { sqlite } = await import("@/data/db");', ""))
  const second = execute(check)
  assert.deepEqual(second, first)
  assert.equal(first.find((row) => row.id === "active").expires_at, "9999-12-31T00:00:00.000Z")
  assert.equal(first.find((row) => row.id === "expired").expires_at, "2000-01-01T00:00:00.000Z")
  assert.ok(Date.parse(first.find((row) => row.id === "pending").expires_at) <= Date.now() + 7 * 86400000)
})
