import Link from "next/link"
import { listPublishedBriefingPosts } from "@/data/content"
import { TaskForm } from "@/ui/briefing/task-form"

export const metadata = { title: "Брифинг" }

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  const posts = await listPublishedBriefingPosts()
  const sent = (await searchParams).task === "1"

  return (
    <div className="flex flex-col gap-6">
      <section className="glass rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="kicker">Internal</p>
        <h1 className="display mt-4 text-4xl sm:text-5xl">Рабочий журнал</h1>
        <p className="mt-4 max-w-xl text-muted">
          Этапы работ, схемы, видео и аудио. Этого раздела нет в открытом меню.
        </p>
      </section>
      {sent ? (
        <p className="glass rounded-full px-5 py-3 text-sm text-cyan">
          Задача ушла в todo админки.
        </p>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/briefing/${post.slug}`}
            className="glass flex flex-col gap-2 rounded-[1.6rem] p-5 text-inherit no-underline"
          >
            <p className="text-[0.68rem] tracking-[0.16em] text-cyan uppercase">
              {post.kicker || post.tags.join(" · ") || "Briefing"}
            </p>
            <h2 className="display text-xl">{post.title}</h2>
            <p className="text-sm text-muted">{post.excerpt}</p>
          </Link>
        ))}
        {posts.length === 0 ? (
          <p className="text-sm text-muted">Пока нет опубликованных этапов.</p>
        ) : null}
      </section>
      <TaskForm />
    </div>
  )
}
