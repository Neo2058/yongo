import Link from "next/link"
import { deleteArchivedLeadAction } from "@/app/actions/leads"
import { listLeadsForOwner } from "@/data/leads"

export const metadata = { title: "Архив заявок" }

export default async function LeadsArchivePage() {
  const leads = await listLeadsForOwner(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Archive</p>
          <h1 className="display mt-2 text-3xl">Архив заявок</h1>
        </div>
        <Link href="/dashboard/leads" className="text-xs tracking-[0.14em] text-cyan uppercase no-underline">
          ← К заявкам
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {leads.map((lead) => (
          <li key={lead.id} className="glass rounded-[1.4rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-muted">
                  {lead.email} · {lead.createdAt.slice(0, 10)}
                </p>
              </div>
              <form action={deleteArchivedLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="glass-btn glass-btn-ghost" type="submit">
                  Удалить
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{lead.message}</p>
          </li>
        ))}
        {leads.length === 0 ? <p className="text-sm text-muted">Архив пуст.</p> : null}
      </ul>
    </div>
  )
}
