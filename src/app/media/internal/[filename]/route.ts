import { readFile } from "node:fs/promises"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireBriefingUser } from "@/data/auth"
import { getMediaRecord } from "@/data/media"

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const user = await requireBriefingUser()
  if (!user) return new NextResponse(null, { status: 404 })

  const { filename } = await context.params
  if (!/^[\w.-]+$/.test(filename)) {
    return new NextResponse(null, { status: 404 })
  }
  const record = await getMediaRecord(filename)
  if (!record || record.visibility !== "internal") {
    return new NextResponse(null, { status: 404 })
  }
  try {
    const file = await readFile(path.join(process.cwd(), "storage", "internal", filename))
    return new NextResponse(file, {
      headers: {
        "Content-Type": record.mime,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
