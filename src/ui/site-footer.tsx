import Link from "next/link"
import { site } from "@/content/site"

export function SiteFooter() {
  return (
    <footer className="mt-auto mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs tracking-[0.16em] text-muted uppercase">
        © {new Date().getFullYear()} {site.name}. Веб-разработка и бизнес-приложения.
      </p>
      <Link
        href="#top"
        className="text-xs tracking-[0.18em] text-muted uppercase no-underline hover:text-cyan"
      >
        ↑ Наверх
      </Link>
      <p className="text-xs tracking-[0.16em] text-muted uppercase">
        Русский · EN · DE · FR
      </p>
    </footer>
  )
}
