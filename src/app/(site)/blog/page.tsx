import type { Metadata } from "next"
import { listPublishedPublicPosts } from "@/data/content"
import { BlogCard } from "@/ui/blog-card"

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Открытый журнал о сборке систем: Next.js, Nest.js, PHP, UE5, C++, Linux и Docker.",
}

export default async function BlogPage() {
  const posts = await listPublishedPublicPosts()

  return (
    <div className="flex flex-col gap-6">
      <section className="glass rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="kicker">Journal</p>
        <h1 className="display mt-4 text-4xl sm:text-6xl">
          PUBLIC
          <span className="mt-2 block font-light tracking-[0.16em] text-white/70">
            BLOG
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Открытый канал. Здесь разбор стека и рабочие заметки, которые можно
          читать без приглашения. Закрытый журнал для руководителей — отдельный
          контур с инвайтом.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </section>
    </div>
  )
}
