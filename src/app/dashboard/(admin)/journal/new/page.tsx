import { ContentForm } from "@/ui/admin/content-form"
import { getTaskForOwner } from "@/data/tasks"

export const metadata = { title: "Новая запись журнала" }

export default async function NewJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const from = (await searchParams).from
  const task = from ? await getTaskForOwner(from) : null

  return (
    <div className="flex flex-col gap-4">
      <h1 className="display text-3xl">Новая запись журнала</h1>
      {task ? (
        <p className="text-sm text-muted">
          По задаче «{task.title}» от {task.authorName}.
        </p>
      ) : null}
      <ContentForm
        defaultChannel="internal"
        initialTitle={task ? task.title : undefined}
        initialExcerpt={task ? `Задача от ${task.authorName}.` : undefined}
        initialBody={
          task
            ? `По задаче от ${task.authorName}:\n\n${task.body}\n\n## Этап\n\n`
            : undefined
        }
      />
    </div>
  )
}
