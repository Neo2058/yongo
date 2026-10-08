import type { Metadata } from "next"
import { getPublishedSitePage } from "@/data/content"
import { ComingSoon } from "@/ui/coming-soon"
import { SitePageView } from "@/ui/site-page"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedSitePage("about")
  if (!page) {
    return {
      title: "Обо мне",
      description: "Биография и стек. Сейчас позиционирование собрано на главной.",
    }
  }
  return { title: page.title, description: page.excerpt }
}

export default async function AboutPage() {
  const page = await getPublishedSitePage("about")
  if (!page) {
    return (
      <ComingSoon
        title="About"
        lead="Биография и развёрнутый стек будут отдельной страницей. Сейчас позиционирование собрано на главной и в журнале."
        href="/order"
        action="Заказать работу"
      />
    )
  }

  return (
    <SitePageView page={page} cta={{ href: "/order", label: "Заказать работу →" }} />
  )
}
