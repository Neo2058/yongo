import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublishedBriefingPost } from "@/data/content"
import { renderMarkdown } from "@/lib/markdown"

interface BriefingPostProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BriefingPostProps) {
  const { slug } = await params
  const post = await getPublishedBriefingPost(slug)
  if (!post) return { title: "Брифинг" }
  return { title: post.title, robots: { index: false, follow: false } }
}

export default async function BriefingPostPage({ params }: BriefingPostProps) {
  const { slug } = await params
  const post = await getPublishedBriefingPost(slug)
  if (!post) notFound()

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/briefing"
        className="w-fit text-[0.72rem] tracking-[0.16em] text-cyan uppercase no-underline"
      >
        ← Журнал
      </Link>
      <header className="glass overflow-hidden rounded-[2rem]">
        {post.cover ? (
          <div className="relative aspect-[2.3/1] min-h-[180px]">
            <img
              src={post.cover}
              alt={post.coverAlt || post.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10">
          <p className="kicker">{post.tags.join(" · ") || "Briefing"}</p>
          <h1 className="display mt-4 text-3xl sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-muted">{post.excerpt}</p>
        </div>
      </header>
      <div className="glass rounded-[2rem] px-6 py-8 sm:px-10 sm:py-12">
        {renderMarkdown(post.body)}
      </div>
    </article>
  )
}
