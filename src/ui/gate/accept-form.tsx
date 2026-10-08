"use client"

import { useActionState } from "react"
import { acceptInviteAction, type InviteState } from "@/app/actions/invites"

export function AcceptForm({ token, email, name }: { token: string; email: string; name: string }) {
  const [state, action, pending] = useActionState(acceptInviteAction, undefined as InviteState)

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <p className="text-sm text-muted">
        {name} · {email}. Задайте пароль — он станет входом на /gate.
      </p>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Пароль
        <input
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Повтор пароля
        <input
          name="confirm"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button className="glass-btn glass-btn-primary" disabled={pending} type="submit">
        {pending ? "Сохраняем…" : "Создать доступ"}
      </button>
    </form>
  )
}
