import Image from "next/image"
import Link from "next/link"
import { listFeaturedPublicPosts } from "@/data/content"
import { site, skills, stack, stats } from "@/content/site"
import { BlogCard } from "@/ui/blog-card"

export default async function HomePage() {
  const featured = await listFeaturedPublicPosts()

  return (
    <div className="flex flex-col gap-6">
      <section className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:p-10">
        <div className="rise flex flex-col justify-center">
          <p className="kicker">{site.role}</p>
          <h1 className="display mt-5 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
            BUILD
            <span className="mt-2 block font-light tracking-[0.18em] text-white/70">
              THE SYSTEM
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Собираю веб, бэкенд, инфраструктуру и realtime в Unreal. Публичный
            блог — открытая часть контура. Заявки и закрытый журнал для
            руководителей подключим следующими этапами.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="glass-btn glass-btn-primary">
              Читать блог →
            </Link>
            <Link href="/contact" className="glass-btn glass-btn-ghost">
              Обсудить задачу
            </Link>
          </div>
          <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-line px-3 py-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            Открыт к задачам
          </p>
        </div>

        <div className="relative mt-8 min-h-[320px] lg:mt-0">
          <div className="relative h-full min-h-[360px] overflow-hidden rounded-[1.6rem] border border-line">
            <Image
              src="/images/hero.jpg"
              alt="Кинематографический 3D-портрет в голографическом визоре — визуальный язык публичной части"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-[center_20%]"
              preload
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#030918] via-transparent to-transparent" />
          </div>
          <div className="absolute right-4 bottom-4 grid size-20 place-items-center rounded-full border border-cyan/30 bg-black/30 text-[0.58rem] tracking-[0.18em] text-cyan uppercase backdrop-blur-md">
            <span className="spin-slow absolute inset-2 rounded-full border border-dashed border-cyan/40" />
            Scroll
          </div>
        </div>
      </section>

      <section className="glass grid gap-6 rounded-[2rem] p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className="border-line px-2 py-3 lg:border-r lg:last:border-r-0">
            <p className="display text-3xl text-white">{item.value}</p>
            <p className="mt-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
              {item.label}
            </p>
          </div>
        ))}
        <blockquote className="text-sm leading-6 text-muted lg:col-span-1">
          Система — это не то, как она выглядит. Система — это как она
          выдерживает нагрузку, отказ и чужой доступ.
        </blockquote>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Featured writing</p>
            <h2 className="display mt-3 text-2xl">Избранные записи блога</h2>
          </div>
          <Link
            href="/blog"
            className="text-[0.72rem] tracking-[0.16em] text-cyan uppercase no-underline"
          >
            Все записи →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((post) => (
            <BlogCard key={post.slug} post={post} featured />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass rounded-[1.6rem] p-6">
          <h2 className="display text-lg">+ Skills</h2>
          <ul className="mt-5 space-y-4">
            {skills.map((skill) => (
              <li key={skill.name}>
                <div className="mb-1 flex justify-between text-xs tracking-[0.08em] text-muted">
                  <span>{skill.name}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-deep to-cyan"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass rounded-[1.6rem] p-6">
          <h2 className="display text-lg">+ Tech stack</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {stack.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-2xl border border-line bg-black/20 px-3 py-3"
              >
                <span className="grid size-9 place-items-center rounded-xl border border-cyan/25 text-[0.65rem] font-bold text-cyan">
                  {item.mark}
                </span>
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass flex flex-col rounded-[1.6rem] p-6">
          <h2 className="display text-lg">+ Build philosophy</h2>
          <div className="relative mx-auto mt-10 grid size-52 place-items-center">
            <span className="absolute top-1 text-[0.62rem] tracking-[0.14em] text-muted uppercase">
              Человек
            </span>
            <span className="absolute right-1 text-[0.62rem] tracking-[0.14em] text-muted uppercase">
              Чистота
            </span>
            <span className="absolute bottom-1 text-[0.62rem] tracking-[0.14em] text-muted uppercase">
              Нагрузка
            </span>
            <span className="absolute left-1 max-w-14 text-[0.62rem] tracking-[0.14em] text-muted uppercase">
              Смысл
            </span>
            <div
              className="size-16 rounded-lg border border-cyan/40 bg-cyan/10 shadow-[0_0_40px_rgba(92,225,255,0.25)]"
              style={{ transform: "rotateX(18deg) rotateZ(45deg)" }}
            />
          </div>
          <p className="mt-auto pt-6 text-sm leading-6 text-muted">
            Сначала контур и права. Потом анимация. CMS без разделения каналов
            public / internal / shop не публикуем.
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <article className="glass rounded-[1.6rem] p-8">
          <h2 className="display text-3xl leading-tight sm:text-4xl">
            Let&apos;s build something extraordinary
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">
            Нужен сайт, сервер, realtime или связка веб + UE5? Опишите задачу.
            Форма заявки с записью в CRM — следующий этап, пока пишите напрямую
            со страницы контакта.
          </p>
          <Link href="/contact" className="glass-btn glass-btn-primary mt-8">
            Get in touch →
          </Link>
        </article>

        <article className="glass rounded-[1.6rem] p-6">
          <h2 className="display text-lg">Contact</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/blog" className="text-muted no-underline hover:text-cyan">
                Журнал → /blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-muted no-underline hover:text-cyan">
                Заявка → /contact
              </Link>
            </li>
            <li className="text-muted">GitHub и почта появятся в CMS</li>
          </ul>
        </article>

        <article className="glass relative min-h-[220px] overflow-hidden rounded-[1.6rem]">
          <Image
            src="/images/crystal.jpg"
            alt="Стеклянная скульптура — акцент фирменного стиля"
            fill
            sizes="(max-width: 1024px) 100vw, 22vw"
            className="object-cover"
          />
        </article>
      </section>
    </div>
  )
}
