import { ContentForm } from "@/ui/admin/content-form"

export const metadata = { title: "Новая услуга" }

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="display text-3xl">Новая услуга</h1>
      <ContentForm defaultChannel="shop" />
    </div>
  )
}
