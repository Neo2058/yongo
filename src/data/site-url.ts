import "server-only"

export function publicSiteUrl() {
  const value = process.env.SITE_URL?.trim() || "http://localhost:3000"
  const url = new URL(value)
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      !["http:", "https:"].includes(url.protocol) ||
      (process.env.NODE_ENV === "production" && (url.protocol !== "https:" || url.hostname === "localhost"))) {
    throw new Error("SITE_URL must be a public HTTPS origin in production.")
  }
  return url.origin
}
