import { updateLeadStatusAction } from "@/app/actions/leads"
import { listLeadsForOwner } from "@/data/leads"

export const metadata = { title: "Заявки" }

export default async function LeadsPage() {
  const leads = await listLeadsForOwner()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="kicker">CRM</p>
        <h1 className="display mt-2 text-3xl">Заявки</h1>
      </div>
      <ul className="flex flex-col gap-3">
        {leads.map((lead) => (
          <li key={lead.id} className="glass rounded-[1.4rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-muted">
                  {lead.email} · {lead.createdAt.slice(0, 10)} · {lead.source}
                </p>
              </div>
              <form action={updateLeadStatusAction} className="flex gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select
                  name="status"
                  defaultValue={lead.status}
                  className="rounded-full border border-line bg-black/30 px-3 py-2 text-xs"
                >
                  <option value="new">new</option>
                  <option value="qualified">qualified</option>
                  <option value="closed">closed</option>
                </select>
                <button className="glass-btn glass-btn-ghost" type="submit">
                  OK
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{lead.message}</p>
          </li>
        ))}
        {leads.length === 0 ? (
          <p className="text-sm text-muted">Заявок пока нет. Форма на /contact пишет сюда.</p>
        ) : null}
      </ul>
    </div>
  )
}
