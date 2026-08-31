"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { nav } from "@/content/site"
import { Logo } from "@/ui/logo"

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-3 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[0.72rem] font-semibold tracking-[0.18em] uppercase no-underline transition-colors ${
                  active ? "text-cyan" : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/contact" className="glass-btn glass-btn-primary hidden lg:inline-flex">
            Let&apos;s talk
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line text-foreground lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="display text-lg leading-none">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-3 rounded-3xl p-4 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-3 py-2 text-sm tracking-[0.16em] uppercase text-foreground no-underline hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="glass-btn glass-btn-primary"
          >
            Let&apos;s talk
          </Link>
        </div>
      ) : null}
    </header>
  )
}
