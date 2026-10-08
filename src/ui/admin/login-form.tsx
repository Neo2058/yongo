"use client"

import { useActionState } from "react"
import { loginAction, type AuthState } from "@/app/actions/auth"

export function LoginForm({
  actionFn = loginAction,
  submitLabel = "Войти",
}: {
  actionFn?: typeof loginAction
  submitLabel?: string
}) {
  const [state, action, pending] = useActionState(actionFn, undefined as AuthState)

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Почта
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Пароль
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={10}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm tracking-normal text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button className="glass-btn glass-btn-primary" disabled={pending} type="submit">
        {pending ? "Входим…" : submitLabel}
      </button>
    </form>
  )
}
