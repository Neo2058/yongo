import Link from "next/link"
import { SiteFooter } from "@/ui/site-footer"
import { SiteHeader } from "@/ui/site-header"

export default function NotFound() {
  return (
    <div className="site-shell flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16 sm:px-6">
        <section className="glass mx-auto max-w-xl rounded-[2rem] px-8 py-14 text-center">
          <title>Страница не найдена · Yongo</title>
          <p className="display text-6xl text-white/20">404</p>
          <h1 className="display mt-4 text-3xl">Страница не найдена</h1>
          <p className="mt-3 text-muted">
            Такого адреса нет. Если вы ждали скрытый раздел — без приглашения он
            выглядит так же.
          </p>
          <Link href="/" className="glass-btn glass-btn-primary mt-8">
            На главную
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
