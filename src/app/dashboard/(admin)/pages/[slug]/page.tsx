import { notFound } from "next/navigation"
import { getSitePageForOwner, isSitePageSlug } from "@/data/content"
import { ContentForm } from "@/ui/admin/content-form"

export const metadata = { title: "Страница — админка" }

interface EditPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditSitePage({ params }: EditPageProps) {
  const { slug } = await params
  if (!isSitePageSlug(slug)) notFound()
  const page = await getSitePageForOwner(slug)
  if (!page) notFound()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="kicker">/{slug}</p>
        <h1 className="display mt-2 text-3xl">Редактирование страницы</h1>
      </div>
      <ContentForm post={page} defaultChannel="public" lockPage />
    </div>
  )
}
