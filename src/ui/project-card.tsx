import Link from "next/link"
import type { PortfolioProject } from "@/content/projects"

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <article className="glass flex h-full flex-col rounded-[1.6rem] p-6 sm:p-8">
      <p className="kicker">{project.category}</p>
      <h3 className="display mt-5 text-3xl"><Link href={`/work/${project.slug}`} className="no-underline hover:text-cyan">{project.title}</Link></h3>
      <p className="mt-4 text-sm leading-7 text-muted">{project.summary}</p>
      <p className="mt-6 border-l-2 border-cyan pl-4 text-sm">{project.outcome}</p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Технологии">
        {project.tags.map((tag) => <li key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-muted">{tag}</li>)}
      </ul>
      <Link href={`/work/${project.slug}`} className="mt-auto pt-8 text-sm text-cyan no-underline">Задача, реализация и результат →</Link>
    </article>
  )
}
