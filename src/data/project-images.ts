import "server-only"
import { readdir } from "node:fs/promises"
import path from "node:path"
import { getProject } from "@/content/projects"

export async function projectImages(slug: string) {
  if (!getProject(slug)) return []
  const directory = path.join(process.cwd(), "public", "images", "work", slug)
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    return entries.filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }))
      .map((entry) => ({ src: `/images/work/${slug}/${encodeURIComponent(entry.name)}`, name: entry.name }))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
}
