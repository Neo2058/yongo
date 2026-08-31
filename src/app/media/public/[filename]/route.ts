import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { getMediaRecord } from "@/data/media"

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params
  if (!/^[\w.-]+$/.test(filename)) {
    return new NextResponse(null, { status: 404 })
  }
  const record = await getMediaRecord(filename)
  if (!record || record.visibility !== "public") {
    return new NextResponse(null, { status: 404 })
  }
  try {
    const file = await readFile(path.join(process.cwd(), "storage", "public", filename))
    return new NextResponse(file, {
      headers: {
        "Content-Type": record.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
