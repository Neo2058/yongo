import Image from "next/image"
import Link from "next/link"
import type { BlogCardPost } from "@/ui/blog-card"

export function ServiceCard({ post }: { post: BlogCardPost }) {
  return (
    <article className="glass flex h-full flex-col overflow-hidden rounded-[1.6rem]">
      <Link href={`/services/${post.slug}`} className="text-inherit no-underline">
        {post.cover ? <div className="relative aspect-[16/10] overflow-hidden bg-black/30">
          {post.cover ? (
            <Image
              src={post.cover}
              unoptimized={post.cover.startsWith("/media/")}
              alt={post.coverAlt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </div> : null}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-cyan uppercase">
            {post.kicker ?? post.tags.join(" · ")}
          </p>
          <h3 className="display text-xl font-medium">{post.title}</h3>
          <p className="text-sm leading-6 text-muted">{post.excerpt}</p>
        </div>
      </Link>
      <div className="mt-auto flex flex-wrap gap-2 px-5 pb-5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-3 py-1 text-[0.65rem] tracking-[0.12em] text-muted uppercase"
          >
            {tag}
          </span>
        ))}
        <Link
          href={`/order?service=${post.slug}`}
          className="glass-btn glass-btn-primary ml-auto"
        >
          Обсудить
        </Link>
      </div>
    </article>
  )
}
