import Link from "next/link"
import { listContentsForOwner } from "@/data/content"
import { listLeadsForOwner } from "@/data/leads"

export const metadata = { title: "Админка" }

export default async function DashboardHome() {
  const [posts, leads] = await Promise.all([listContentsForOwner(), listLeadsForOwner()])
  const drafts = posts.filter((item) => item.status === "draft").length
  const journal = posts.filter((item) => item.channel === "internal").length
  const freshLeads = leads.filter((item) => item.status === "new").length

  return (
    <div className="flex flex-col gap-4">
      <section className="glass rounded-[1.6rem] p-6">
        <p className="kicker">CMS + CRM</p>
        <h1 className="display mt-3 text-3xl">Обзор</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Здесь пишутся открытые статьи, закрытый журнал для руководителей и
          собираются заявки. Публичное меню сюда не ведёт.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/content" className="glass rounded-[1.6rem] p-5 text-inherit no-underline">
          <p className="display text-3xl">{posts.filter((item) => item.channel === "public").length}</p>
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
      </section>
    </div>
  )
}
