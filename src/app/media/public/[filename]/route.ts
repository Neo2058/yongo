import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { getMediaRecord } from "@/data/media"
import { requireOwner } from "@/data/auth"
import { mediaIsPublished } from "@/data/media-policy"

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params
  if (!/^[A-Za-z0-9_-]{43}\.[a-z0-9]+$/.test(filename)) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } })
  }
  const record = await getMediaRecord(filename)
  if (!record || record.visibility !== "public") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } })
  }
  if (!mediaIsPublished(filename, "public") && !await requireOwner()) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store" } })
  }
  try {
    const file = await readFile(path.join(process.cwd(), "storage", "public", filename))
    return new NextResponse(file, {
      headers: {
        "Content-Type": record.mime,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "private, no-store",
      },
    })
  } catch {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } })
  }
}
