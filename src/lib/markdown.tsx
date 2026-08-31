import type { ReactNode } from "react"

function escapeText(value: string) {
  return value
}

function allowedSrc(src: string) {
  return (
    src.startsWith("/images/") ||
    src.startsWith("/media/public/") ||
    src.startsWith("/media/internal/")
  )
}

export function renderMarkdown(source: string) {
  const blocks = source.replaceAll("\r\n", "\n").trim().split(/\n{2,}/)
  const nodes: ReactNode[] = []

  blocks.forEach((raw, index) => {
    const block = raw.trim()
    if (!block) return

    if (block.startsWith("## ")) {
      nodes.push(
        <h2 key={index} className="display mt-10 text-2xl">
          {escapeText(block.slice(3))}
        </h2>,
      )
      return
    }

    if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
      nodes.push(
        <ul key={index} className="mt-4 list-disc space-y-2 pl-5 text-muted">
          {block.split("\n").map((line) => (
            <li key={line}>{escapeText(line.trim().slice(2))}</li>
          ))}
        </ul>,
      )
      return
    }

    const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (image && allowedSrc(image[2])) {
      nodes.push(
        <img
          key={index}
          src={image[2]}
          alt={image[1]}
          className="mt-6 w-full rounded-2xl border border-line"
        />,
      )
      return
    }

    nodes.push(
      <p key={index} className="mt-4 leading-8 text-muted">
        {escapeText(block)}
      </p>,
    )
  })

  return nodes
}
