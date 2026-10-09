import assert from "node:assert/strict"
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { once } from "node:events"
import { randomBytes } from "node:crypto"

const root = fileURLToPath(new URL("../", import.meta.url))
const source = path.join(root, ".next/standalone")
if (!existsSync(path.join(source, "server.js"))) throw new Error("Run yarn build first")
const temporary = mkdtempSync(path.join(tmpdir(), "yongo-production-"))
let child
try {
  cpSync(source, temporary, {
    recursive: true,
    filter: (entry) => {
      const relative = path.relative(source, entry)
      const first = relative.split(path.sep)[0]
      return !["data", "storage"].includes(first) && !path.basename(entry).startsWith(".env")
    },
  })
  cpSync(path.join(root, ".next/static"), path.join(temporary, ".next/static"), { recursive: true })
  cpSync(path.join(root, "public"), path.join(temporary, "public"), { recursive: true })
  const probe = createServer()
  probe.listen(0, "127.0.0.1")
  await once(probe, "listening")
  const port = probe.address().port
  await new Promise((resolve) => probe.close(resolve))
  let output = ""
  child = spawn(process.execPath, [path.join(temporary, "server.js")], {
    cwd: temporary,
    env: { ...process.env, NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: String(port), SITE_URL: "https://example.test", OWNER_EMAIL: "smoke@example.test", OWNER_PASSWORD: randomBytes(24).toString("hex"), TRUST_PROXY: "0", SMTP_HOST: "" },
    stdio: ["ignore", "pipe", "pipe"],
  })
  child.stdout.on("data", (chunk) => { output += chunk })
  child.stderr.on("data", (chunk) => { output += chunk })
  const base = `http://127.0.0.1:${port}`
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Standalone server exited: ${output}`)
    try { await fetch(`${base}/favicon.ico`, { signal: AbortSignal.timeout(1000) }); ready = true; break }
    catch { await new Promise((resolve) => setTimeout(resolve, 100)) }
  }
  if (!ready) throw new Error(`Server did not become ready: ${output}`)
  for (const url of ["/", "/services", "/blog", "/work", "/robots.txt", "/sitemap.xml"]) {
    const response = await fetch(base + url)
    assert.equal(response.status, 200, url)
    const body = await response.text()
    assert.equal(body.includes("fonts.googleapis.com"), false, url)
    if (url === "/") {
      assert.ok(response.headers.get("Content-Security-Policy"))
      assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff")
      assert.equal(response.headers.get("X-Frame-Options"), "DENY")
      const nonce = response.headers.get("Content-Security-Policy").match(/'nonce-([^']+)'/)[1]
      assert.ok(body.includes(`nonce="${nonce}"`), "HTML script nonce matches CSP")
    }
    if (url === "/sitemap.xml") assert.equal(/\/briefing|\/gate|\/i\//.test(body), false)
  }
  for (const url of ["/briefing", "/briefing/guess", "/i/guess", `/media/internal/${"a".repeat(43)}.png`]) {
    const response = await fetch(base + url, { headers: { purpose: "prefetch" } })
    // Next can stream notFound as HTTP 200 after flushing a layout; both paths
    // must render the neutral 404, never sensitive content.
    const body = await response.text()
    assert.ok(response.status === 404 || body.includes("NEXT_HTTP_ERROR_FALLBACK;404"), url)
    assert.ok(response.headers.get("Cache-Control")?.includes("no-store"), url)
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow", url)
  }
  const dashboard = await fetch(base + "/dashboard", { redirect: "manual" })
  assert.equal(dashboard.status, 307)
  assert.ok(dashboard.headers.get("Location").endsWith("/dashboard/login"))
  const forbiddenOptimization = await fetch(base + `/_next/image?url=${encodeURIComponent(`/media/public/${"a".repeat(43)}.png`)}&w=640&q=75`)
  assert.equal(forbiddenOptimization.status, 400)
  console.info("Production smoke: public routes, closed access, headers, CSP nonce, sitemap and optimizer isolation passed.")
} finally {
  if (child && child.exitCode === null) {
    const exited = once(child, "exit")
    child.kill("SIGTERM")
    await exited
  }
  rmSync(temporary, { recursive: true, force: true })
}
