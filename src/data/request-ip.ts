import "server-only"

import { isIP } from "node:net"

// Only a private, explicitly trusted reverse proxy may supply this header.
// Without one, use a shared bucket rather than trusting client input.
export function requestIp(h: Headers) {
  if (process.env.TRUST_PROXY !== "1") return "unknown"
  const ip = h.get("x-real-ip")?.trim() ?? ""
  return isIP(ip) ? ip : "unknown"
}
