import Image from "next/image"
import Link from "next/link"

export type BlogCardPost = {
  slug: string
  title: string
  excerpt: string
  cover: string
  coverAlt: string
  tags: string[]
  kicker?: string
}

export function BlogCard({
  post,
  featured = false,
}: {
  post: BlogCardPost
  featured?: boolean
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass group flex h-full flex-col overflow-hidden rounded-[1.6rem] text-inherit no-underline"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black/30">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-cyan uppercase">
          {post.kicker ?? post.tags.join(" · ")}
        </p>
        <h3 className={`display font-medium ${featured ? "text-2xl" : "text-xl"}`}>
          {post.title}
        </h3>
        <p className="text-sm leading-6 text-muted">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line px-3 py-1 text-[0.65rem] tracking-[0.12em] text-muted uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
