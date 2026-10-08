import { notFound } from "next/navigation"
import { getContentForOwner } from "@/data/content"
import { ContentForm } from "@/ui/admin/content-form"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditPageProps) {
  const { id } = await params
  const post = await getContentForOwner(id)
  if (!post || post.channel !== "shop") notFound()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="display text-3xl">Редактирование услуги</h1>
      <ContentForm post={post} defaultChannel="shop" />
    </div>
  )
}
