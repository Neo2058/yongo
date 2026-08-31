import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublishedPublicPost, listPublishedPublicPosts } from "@/data/content"
import { renderMarkdown } from "@/lib/markdown"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await listPublishedPublicPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPublicPost(slug)
  if (!post) return { title: "Запись не найдена" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPublicPost(slug)

  if (!post) notFound()

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/blog"
        className="w-fit text-[0.72rem] tracking-[0.16em] text-cyan uppercase no-underline"
      >
        ← Журнал
      </Link>

      <header className="glass overflow-hidden rounded-[2rem]">
        {post.cover ? (
        <div className="relative aspect-[2.3/1] min-h-[220px]">
          <Image
            src={post.cover}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 1200px) 100vw, 1120px"
            className="object-cover"
            preload
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#030918] via-[#030918]/30 to-transparent" />
        </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10">
          <p className="kicker">{post.tags.join(" · ")}</p>
          <h1 className="display mt-4 max-w-3xl text-3xl sm:text-5xl">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{post.excerpt}</p>
          <p className="mt-4 text-[0.72rem] tracking-[0.16em] text-muted uppercase">
            {post.publishedAt} · {post.reading}
          </p>
        </div>
      </header>

      <div className="glass rounded-[2rem] px-6 py-8 sm:px-10 sm:py-12">
        {renderMarkdown(post.body)}
      </div>
    </article>
  )
}
