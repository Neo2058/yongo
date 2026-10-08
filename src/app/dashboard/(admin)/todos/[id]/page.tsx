import Link from "next/link"
import { notFound } from "next/navigation"
import { archiveTaskAction, updateTaskStatusAction } from "@/app/actions/tasks"
import { getTaskForOwner } from "@/data/tasks"

interface TaskPageProps {
  params: Promise<{ id: string }>
}

export const metadata = { title: "Задача" }

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const { id } = await params
  const task = await getTaskForOwner(id)
  if (!task) notFound()

  return (
    <article className="flex flex-col gap-4">
      <Link
        href="/dashboard/todos"
        className="w-fit text-xs tracking-[0.14em] text-cyan uppercase no-underline"
      >
        ← Todo
      </Link>
      <section className="glass rounded-[1.6rem] p-6">
        <p className="kicker">{task.status}</p>
        <h1 className="display mt-3 text-3xl">{task.title}</h1>
        <p className="mt-2 text-xs text-muted">
          {task.authorName} · {task.createdAt.slice(0, 16).replace("T", " ")}
        </p>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-muted">{task.body}</p>
      </section>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/dashboard/journal/new?from=${task.id}`}
          className="glass-btn glass-btn-primary"
        >
          Запись в журнал
        </Link>
        {task.status !== "archived" ? (
          <form action={updateTaskStatusAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="status" value="done" />
            <button className="glass-btn glass-btn-ghost" type="submit">
              Отметить выполненной
            </button>
          </form>
        ) : null}
        {task.status === "done" ? (
          <form action={archiveTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <button className="glass-btn glass-btn-ghost" type="submit">
              В архив
            </button>
          </form>
        ) : null}
      </div>
    </article>
  )
}
