import Link from "next/link"
import { listFeaturedShopServices, getPublishedSitePage } from "@/data/content"
import { site, stats } from "@/content/site"
import { projects } from "@/content/projects"
import { ServiceCard } from "@/ui/service-card"
import { ProjectCard } from "@/ui/project-card"

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [services, work] = await Promise.all([listFeaturedShopServices(), getPublishedSitePage("work")])
  const sent = (await searchParams).sent === "1"
  return (
    <div className="flex flex-col gap-8">
      {sent ? <p role="status" className="glass rounded-2xl px-5 py-4 text-sm text-cyan">Спасибо! Заявка получена. Я отвечу на указанную почту.</p> : null}
      <section className="glass overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
        <p className="kicker">{site.role}</p>
        <h1 className="display mt-7 max-w-4xl text-3xl leading-tight sm:text-5xl lg:text-6xl">Сайты и приложения<br /><span className="text-cyan">для задач бизнеса</span></h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">Разрабатываю и дорабатываю сайты, формы заявок и административные панели. Помогаю автоматизировать рабочие процессы — от обсуждения задачи до запуска.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/order" className="glass-btn glass-btn-primary">Обсудить задачу →</Link>
          {work ? <Link href="/work" className="glass-btn glass-btn-ghost">Посмотреть проекты</Link> : null}
        </div>
        <p className="mt-8 text-sm text-muted"><span className="mr-2 inline-block size-2 rounded-full bg-emerald-400" />{site.availability}</p>
        <p className="mt-3 text-sm text-muted">{site.languages}</p>
      </section>
      <section aria-label="Опыт" className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => <div key={item.label} className="glass rounded-3xl p-6"><p className="display text-3xl text-cyan">{item.value}</p><p className="mt-3 text-sm text-muted">{item.label}</p></div>)}
      </section>
      {work ? <section aria-labelledby="projects-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="kicker">Коммерческий опыт</p><h2 id="projects-heading" className="display mt-3 text-2xl sm:text-3xl">Разработал и запустил</h2></div><Link href="/work" className="text-sm text-cyan">Все проекты →</Link></div>
        <div className="grid gap-4 md:grid-cols-2">{projects.slice(0, 2).map((project) => <ProjectCard key={project.slug} project={project} />)}</div>
        <p className="mt-4 text-sm leading-6 text-muted">Рабочие системы заказчиков закрыты. В кейсах — описание моей работы и материалы на тестовых данных.</p>
      </section> : null}
      <section aria-labelledby="services-heading">
        <p className="kicker">С чем могу помочь</p><h2 id="services-heading" className="display mt-3 mb-5 text-2xl sm:text-3xl">Начнём с конкретной задачи</h2>
        <div className="grid gap-4 md:grid-cols-3">{services.map((service) => <ServiceCard key={service.slug} post={service} />)}</div>
      </section>
      <section className="glass rounded-[2rem] p-6 sm:p-10" aria-labelledby="process-heading">
        <h2 id="process-heading" className="display text-2xl">Как строится работа</h2>
        <ol className="mt-7 grid gap-7 md:grid-cols-3">{[
          ["01", "Обсуждаем задачу", "Вы присылаете описание, ссылку на проект и желаемый срок. Я уточняю детали."],
          ["02", "Согласуем этап", "Фиксируем объём, стоимость, срок и то, как проверим результат."],
          ["03", "Реализую и передаю", "Проверяю согласованные сценарии, показываю результат и передаю изменения."],
        ].map(([number, title, body]) => <li key={number}><p className="text-sm text-cyan">{number}</p><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted">{body}</p></li>)}</ol>
      </section>
      <section className="glass rounded-[2rem] p-6 sm:p-10">
        <h2 className="display text-2xl sm:text-3xl">Есть задача для вашего сайта?</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">Опишите, что нужно исправить или добавить. Можно начать с небольшой доработки.</p>
        <Link href="/order" className="glass-btn glass-btn-primary mt-6">Обсудить задачу →</Link>
      </section>
    </div>
  )
}
