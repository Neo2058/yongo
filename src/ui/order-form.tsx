"use client"

import { useActionState } from "react"
import { submitOrderAction, type OrderFormState } from "@/app/actions/orders"

export function OrderForm({
  services,
  selected,
}: {
  services: { slug: string; title: string }[]
  selected?: string
}) {
  const [state, action, pending] = useActionState(submitOrderAction, undefined as OrderFormState)

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="absolute -left-[9999px]" htmlFor="company">
        Компания
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Услуга
        <select
          name="service"
          defaultValue={selected ?? ""}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        >
          <option value="">Индивидуальный запрос</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
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
        Что нужно сделать
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
        {pending ? "Отправляем…" : "Отправить запрос"}
      </button>
    </form>
  )
}
