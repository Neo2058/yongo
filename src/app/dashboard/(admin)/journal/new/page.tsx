import { ContentForm } from "@/ui/admin/content-form"

export const metadata = { title: "Новая запись журнала" }

export default function NewJournalPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="display text-3xl">Новая запись журнала</h1>
      <ContentForm defaultChannel="internal" />
    </div>
  )
}
