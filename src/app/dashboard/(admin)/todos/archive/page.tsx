import Link from "next/link"
import { deleteArchivedTaskAction } from "@/app/actions/tasks"
import { listTasksForOwner } from "@/data/tasks"

export const metadata = { title: "Архив todo" }

export default async function TodosArchivePage() {
  const tasks = await listTasksForOwner(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Archive</p>
          <h1 className="display mt-2 text-3xl">Архив задач</h1>
        </div>
        <Link href="/dashboard/todos" className="text-xs tracking-[0.14em] text-cyan uppercase no-underline">
          ← К списку
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id} className="glass rounded-[1.4rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted">
                  {task.authorName} · {task.createdAt.slice(0, 10)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/todos/${task.id}`} className="glass-btn glass-btn-ghost">
                  Открыть
                </Link>
                <form action={deleteArchivedTaskAction}>
                  <input type="hidden" name="id" value={task.id} />
                  <button className="glass-btn glass-btn-ghost" type="submit">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{task.body}</p>
          </li>
        ))}
        {tasks.length === 0 ? <p className="text-sm text-muted">Архив пуст.</p> : null}
      </ul>
    </div>
  )
}
