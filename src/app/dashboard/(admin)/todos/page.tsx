import Link from "next/link"
import { archiveTaskAction, updateTaskStatusAction } from "@/app/actions/tasks"
import { listTasksForOwner } from "@/data/tasks"

export const metadata = { title: "Todo" }

export default async function TodosPage() {
  const tasks = await listTasksForOwner(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">From briefing</p>
          <h1 className="display mt-2 text-3xl">Todo</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Задачи от руководителей. Откройте карточку, чтобы прочитать целиком
            или завести запись в закрытый журнал.
          </p>
        </div>
        <Link href="/dashboard/todos/archive" className="text-xs tracking-[0.14em] text-cyan uppercase no-underline">
          Архив →
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id} className="glass rounded-[1.4rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted">
                  {task.authorName} · {task.createdAt.slice(0, 10)} · {task.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/todos/${task.id}`} className="glass-btn glass-btn-ghost">
                  Открыть
                </Link>
                <form action={updateTaskStatusAction} className="flex gap-2">
                  <input type="hidden" name="id" value={task.id} />
                  <select
                    name="status"
                    defaultValue={task.status}
                    className="rounded-full border border-line bg-black/30 px-3 py-2 text-xs"
                  >
                    <option value="new">new</option>
                    <option value="in_progress">in progress</option>
                    <option value="done">done</option>
                  </select>
                  <button className="glass-btn glass-btn-ghost" type="submit">
                    OK
                  </button>
                </form>
                {task.status === "done" ? (
                  <form action={archiveTaskAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <button className="glass-btn glass-btn-ghost" type="submit">
                      В архив
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
            <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-muted">{task.body}</p>
          </li>
        ))}
        {tasks.length === 0 ? <p className="text-sm text-muted">Пока пусто.</p> : null}
      </ul>
    </div>
  )
}
