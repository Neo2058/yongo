"use client"

import { useActionState } from "react"
import { submitLeadAction, type LeadFormState } from "@/app/actions/leads"

export function ContactForm() {
  const [state, action, pending] = useActionState(submitLeadAction, undefined as LeadFormState)

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="absolute -left-[9999px]" htmlFor="company">
        Компания
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </label>
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
        Почта
        <input
          name="email"
          type="email"
          required
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Задача
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button className="glass-btn glass-btn-primary self-start" disabled={pending} type="submit">
        {pending ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  )
}
