export function publicSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  return "http://localhost:3000"
}

export function originFromHeaders(h: Headers) {
  const fromEnv = process.env.SITE_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  return `${proto}://${host}`
}
