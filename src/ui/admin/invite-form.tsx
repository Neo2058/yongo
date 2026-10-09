"use client"

import { useActionState } from "react"
import { createInviteAction, type InviteState } from "@/app/actions/invites"

export function InviteForm() {
  const [state, action, pending] = useActionState(createInviteAction, undefined as InviteState)

  return (
    <form action={action} className="glass flex flex-col gap-4 rounded-[1.6rem] p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Имя
          <input
            name="name"
            required
            minLength={2}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Почта (логин)
          <input
            name="email"
            type="email"
            required
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
          />
        </label>
      </div>
      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state?.url ? (
        <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4 text-sm">
          <p className="text-cyan">
            Перешлите {state.email}. Ссылка одноразовая и действует 7 дней. После входа доступ сохраняется до отзыва:
          </p>
          <p
            id="invite-url"
            data-email={state.email}
            className="mt-2 break-all text-foreground"
          >
            {state.url}
          </p>
        </div>
      ) : null}
      <button className="glass-btn glass-btn-primary self-start" disabled={pending} type="submit">
        {pending ? "Создаём…" : "Создать приглашение"}
      </button>
    </form>
  )
}
