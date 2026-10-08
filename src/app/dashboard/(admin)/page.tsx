import Link from "next/link"
import { listContentsForOwner } from "@/data/content"
import { listLeadsForOwner } from "@/data/leads"
import { listOrdersForOwner } from "@/data/orders"
import { listTasksForOwner } from "@/data/tasks"

export const metadata = { title: "Админка" }

export default async function DashboardHome() {
  const [posts, leads, orders, todos] = await Promise.all([
    listContentsForOwner(),
    listLeadsForOwner(),
    listOrdersForOwner(),
    listTasksForOwner(),
  ])
  const articles = posts.filter((item) => item.channel === "public" && item.type === "article")
  const drafts = articles.filter((item) => item.status === "draft").length
  const journal = posts.filter((item) => item.channel === "internal").length
  const shop = posts.filter((item) => item.channel === "shop")
  const sitePages = posts.filter((item) => item.type === "page")
  const freshLeads = leads.filter((item) => item.status === "new").length
  const freshOrders = orders.filter((item) => item.status === "new").length

  return (
    <div className="flex flex-col gap-4">
      <section className="glass rounded-[1.6rem] p-6">
        <p className="kicker">CMS + CRM</p>
        <h1 className="display mt-3 text-3xl">Обзор</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Каталог услуг, заказы без оплаты, страницы /work и /about, открытый
          блог, закрытый журнал и заявки. Публичное меню сюда не ведёт.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/services" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{shop.length}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Услуг в каталоге</p>
          <p className="mt-1 text-xs text-muted">
            {shop.filter((item) => item.status === "published").length} опубликовано
          </p>
        </Link>
        <Link href="/dashboard/orders" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{freshOrders}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Новых заказов</p>
          <p className="mt-1 text-xs text-muted">всего {orders.length}</p>
        </Link>
        <Link href="/dashboard/pages" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{sitePages.filter((item) => item.status === "published").length}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Страниц на сайте</p>
          <p className="mt-1 text-xs text-muted">/work и /about</p>
        </Link>
        <Link href="/dashboard/content" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{articles.length}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Записей блога</p>
          <p className="mt-1 text-xs text-muted">{drafts} черновиков</p>
        </Link>
        <Link href="/dashboard/journal" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{journal}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Закрытый журнал</p>
        </Link>
        <Link href="/dashboard/leads" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{freshLeads}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Новых заявок</p>
          <p className="mt-1 text-xs text-muted">всего {leads.length}</p>
        </Link>
        <Link href="/dashboard/todos" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{todos.filter((item) => item.status !== "done").length}</p>
          <p className="mt-2 text-xs tracking-[0.14em] text-muted uppercase">Открытых todo</p>
        </Link>
      </section>
    </div>
  )
}
