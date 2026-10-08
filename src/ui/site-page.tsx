import Image from "next/image"
import Link from "next/link"
import type { ContentDTO } from "@/data/content"
import { renderMarkdown } from "@/lib/markdown"

export function SitePageView({
  page,
  cta,
}: {
  page: ContentDTO
  cta?: { href: string; label: string }
}) {
  return (
    <article className="flex flex-col gap-6">
      <header className="glass overflow-hidden rounded-[2rem]">
        {page.cover ? (
          <div className="relative aspect-[2.3/1] min-h-[220px]">
            <Image
              src={page.cover}
              alt={page.coverAlt || page.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1120px"
              className="object-cover"
              preload
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#030918] via-[#030918]/30 to-transparent" />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10">
          <p className="kicker">{page.kicker || page.tags.join(" · ")}</p>
          <h1 className="display mt-4 max-w-3xl text-3xl sm:text-5xl">{page.title}</h1>
          {page.excerpt ? <p className="mt-4 max-w-2xl text-muted">{page.excerpt}</p> : null}
          {cta ? (
            <Link href={cta.href} className="glass-btn glass-btn-primary mt-8">
              {cta.label}
            </Link>
          ) : null}
        </div>
      </header>
      <div className="glass rounded-[2rem] px-6 py-8 sm:px-10 sm:py-12">
        {renderMarkdown(page.body)}
      </div>
    </article>
  )
}
