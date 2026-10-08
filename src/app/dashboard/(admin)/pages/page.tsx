import Link from "next/link"
import { listSitePagesForOwner } from "@/data/content"

export const metadata = { title: "Страницы — админка" }

const routes: Record<string, string> = {
  work: "/work",
  about: "/about",
}

export default async function SitePagesAdminPage() {
  const pages = await listSitePagesForOwner()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="kicker">Site pages</p>
        <h1 className="display mt-2 text-3xl">Страницы</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          /work и /about. Адрес фиксированный, в блог не попадают. Снимите с
          публикации — на сайте снова заглушка.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {pages.map((page) => (
          <li
            key={page.id}
            className="glass flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] px-5 py-4"
          >
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-xs text-muted">
                {page.status} · {routes[page.slug] ?? `/${page.slug}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={routes[page.slug] ?? `/${page.slug}`} className="glass-btn glass-btn-ghost">
                Открыть
              </Link>
              <Link href={`/dashboard/pages/${page.slug}`} className="glass-btn glass-btn-primary">
                Править
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
