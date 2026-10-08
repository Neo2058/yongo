import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProject } from "@/content/projects"
import { getPublishedSitePage } from "@/data/content"
import { projectImages } from "@/data/project-images"

type Props = { params: Promise<{ slug: string }> }

async function publishedProject(slug: string) {
  const project = getProject(slug)
  if (!project || !(await getPublishedSitePage("work"))) notFound()
  return project
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await publishedProject((await params).slug)
  return { title: project.title, description: project.summary }
}

export default async function ProjectPage({ params }: Props) {
  const project = await publishedProject((await params).slug)
  const images = await projectImages(project.slug)
  return (
    <article className="flex flex-col gap-6">
      <Link href="/work" className="w-fit text-sm text-cyan">← Все проекты</Link>
      <header className="glass rounded-[2rem] p-6 sm:p-10">
        <p className="kicker">{project.category}</p>
        <h1 className="display mt-5 break-words text-4xl sm:text-6xl">{project.title}</h1>
        <p className="mt-5 max-w-2xl leading-8 text-muted">{project.summary}</p>
        <p className="mt-6 text-lg text-cyan">{project.outcome}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Технологии">{project.tags.map((tag) => <li key={tag} className="rounded-full border border-line px-3 py-1 text-xs text-muted">{tag}</li>)}</ul>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass rounded-3xl p-6 sm:p-8"><h2 className="display text-xl">Задача</h2><p className="mt-4 leading-7 text-muted">{project.task}</p></section>
        <section className="glass rounded-3xl p-6 sm:p-8"><h2 className="display text-xl">Моя роль</h2><p className="mt-4 leading-7 text-muted">{project.role}</p></section>
      </div>
      <section className="glass rounded-3xl p-6 sm:p-8"><h2 className="display text-xl">Что реализовано</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{project.features.map((feature) => <li key={feature} className="border-l border-cyan/50 pl-4 text-muted">{feature}</li>)}</ul></section>
      {images.length > 0 ? <section aria-labelledby="screenshots-heading"><h2 id="screenshots-heading" className="display mb-5 text-2xl">Интерфейс на тестовых данных</h2><div className="grid gap-5">{images.map((image, index) => <figure key={image.src} className="glass overflow-hidden rounded-3xl p-3 sm:p-5"><a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Открыть скриншот ${index + 1} проекта ${project.title}`}><Image src={image.src} alt={`${project.title}: демонстрационный экран ${index + 1} на тестовых данных`} width={1600} height={1000} sizes="(max-width: 1200px) 100vw, 1120px" className="h-auto w-full rounded-xl" /></a><figcaption className="px-2 pt-3 text-sm text-muted">{project.title} · экран {index + 1} · тестовые данные</figcaption></figure>)}</div></section> : null}
      <section className="glass rounded-3xl p-6 sm:p-8"><h2 className="display text-xl">Результат</h2><p className="mt-4 leading-7 text-muted">{project.result}</p>{project.commercial ? <p className="mt-4 text-sm leading-6 text-muted">Закрытый коммерческий продукт. Доступ к рабочей системе и данным заказчика не предоставляется. Демонстрационные материалы публикуются на тестовых данных.</p> : null}<Link href="/order" className="glass-btn glass-btn-primary mt-7">Обсудить похожую задачу →</Link></section>
    </article>
  )
}
