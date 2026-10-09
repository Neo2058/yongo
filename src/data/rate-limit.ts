import "server-only"

import { sqlite } from "@/data/db"
import { hashToken } from "@/data/crypto"
import { migrate } from "@/data/migrate"

const MAX_BUCKETS = 10000

export function rateLimit(key: string, limit: number, windowMs: number) {
  migrate()
  const now = Date.now()
  const keyHash = hashToken(key)
  return sqlite.transaction(() => {
    sqlite.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").run(now)
    const current = sqlite.prepare("SELECT count FROM rate_limits WHERE key_hash = ?")
      .get(keyHash) as { count: number } | undefined
    if (!current) {
      const total = sqlite.prepare("SELECT count(*) AS count FROM rate_limits").get() as { count: number }
      // Bound storage and fail closed instead of evicting active limits.
      if (total.count >= MAX_BUCKETS) return { ok: false, remaining: 0 }
      sqlite.prepare("INSERT INTO rate_limits VALUES (?, 1, ?)").run(keyHash, now + windowMs)
      return { ok: true, remaining: limit - 1 }
    }
    if (current.count >= limit) return { ok: false, remaining: 0 }
    sqlite.prepare("UPDATE rate_limits SET count = count + 1 WHERE key_hash = ?").run(keyHash)
    return { ok: true, remaining: limit - current.count - 1 }
  }).immediate()
}
