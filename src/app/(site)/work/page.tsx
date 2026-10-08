import { projects } from "@/content/projects"
import { ProjectCard } from "@/ui/project-card"
import type { Metadata } from "next"
import { getPublishedSitePage } from "@/data/content"
import { ComingSoon } from "@/ui/coming-soon"
import { SitePageView } from "@/ui/site-page"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedSitePage("work")
  if (!page) {
    return {
      title: "Работы",
      description: "Примеры разработки сайтов и бизнес-приложений.",
    }
  }
  return { title: page.title, description: page.excerpt }
}

export default async function WorkPage() {
  const page = await getPublishedSitePage("work")
  if (!page) {
    return (
      <ComingSoon
        title="Проекты"
        lead="Описание проектов обновляется. Вы можете посмотреть услуги или обсудить свою задачу."
        href="/services"
        action="Смотреть услуги"
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SitePageView page={page} />
      <section aria-label="Проекты" className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => <ProjectCard key={project.slug} project={project} />)}
      </section>
    </div>
  )
}
