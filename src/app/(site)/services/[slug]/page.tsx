import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getPublishedShopService, listPublishedShopServices } from "@/data/content"
import { renderMarkdown } from "@/lib/markdown"

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const services = await listPublishedShopServices()
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getPublishedShopService(slug)
  if (!service) return { title: "Услуга не найдена" }
  return { title: service.title, description: service.excerpt }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = await getPublishedShopService(slug)
  if (!service) notFound()

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/services"
        className="w-fit text-[0.72rem] tracking-[0.16em] text-cyan uppercase no-underline"
      >
        ← Услуги
      </Link>
      <header className="glass overflow-hidden rounded-[2rem]">
        {service.cover ? (
          <div className="relative aspect-[2.3/1] min-h-[220px]">
            <Image
              src={service.cover}
              alt={service.coverAlt || service.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1120px"
              className="object-cover"
              preload
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#030918] via-[#030918]/30 to-transparent" />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10">
          <p className="kicker">{service.kicker || service.tags.join(" · ")}</p>
          <h1 className="display mt-4 max-w-3xl text-3xl sm:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{service.excerpt}</p>
          <Link href={`/order?service=${service.slug}`} className="glass-btn glass-btn-primary mt-8">
            Заказать эту услугу
          </Link>
        </div>
      </header>
      <div className="glass rounded-[2rem] px-6 py-8 sm:px-10 sm:py-12">
        {renderMarkdown(service.body)}
      </div>
    </article>
  )
}
