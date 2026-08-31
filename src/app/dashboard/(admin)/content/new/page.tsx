import { ContentForm } from "@/ui/admin/content-form"

export const metadata = { title: "Новая статья" }

export default function NewContentPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="display text-3xl">Новая статья</h1>
      <ContentForm defaultChannel="public" />
    </div>
  )
}
