"use client"

import { useActionState } from "react"
import { createTaskAction, type TaskState } from "@/app/actions/tasks"

export function TaskForm() {
  const [state, action, pending] = useActionState(createTaskAction, undefined as TaskState)

  return (
    <form action={action} className="glass flex flex-col gap-4 rounded-[1.6rem] p-6">
      <h2 className="display text-xl">Поставить задачу</h2>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Заголовок
        <input
          name="title"
          required
          minLength={3}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Описание
        <textarea
          name="body"
          required
          minLength={5}
          rows={4}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button className="glass-btn glass-btn-primary self-start" disabled={pending} type="submit">
        {pending ? "Отправляем…" : "Отправить в todo"}
      </button>
    </form>
  )
}
