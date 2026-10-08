"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/actions/auth"

const links = [
  { href: "/dashboard", label: "Обзор" },
  { href: "/dashboard/content", label: "Блог" },
  { href: "/dashboard/pages", label: "Страницы" },
  { href: "/dashboard/services", label: "Услуги" },
  { href: "/dashboard/journal", label: "Журнал" },
  { href: "/dashboard/leads", label: "Заявки" },
  { href: "/dashboard/orders", label: "Заказы" },
  { href: "/dashboard/todos", label: "Todo" },
  { href: "/dashboard/access", label: "Доступ" },
]

export function ShellNav({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <aside className="glass flex w-full flex-col rounded-[1.6rem] p-5 lg:w-64">
      <p className="display text-sm tracking-[0.18em] uppercase">Console</p>
      <p className="mt-2 truncate text-xs text-muted">{email}</p>
      <nav className="mt-6 flex flex-col gap-2">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-3 py-2 text-sm no-underline ${
                active ? "bg-cyan/15 text-cyan" : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <form action={logoutAction} className="mt-auto pt-6">
        <button className="glass-btn glass-btn-ghost w-full" type="submit">
          Выйти
        </button>
      </form>
    </aside>
  )
}
