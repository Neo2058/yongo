import Link from "next/link"
import { archiveOrderAction, updateOrderStatusAction } from "@/app/actions/orders"
import { listOrdersForOwner } from "@/data/orders"

export const metadata = { title: "Заказы" }

const statuses = [
  { value: "new", label: "новый" },
  { value: "qualified", label: "уточняем" },
  { value: "in_progress", label: "в работе" },
  { value: "delivered", label: "сдано" },
  { value: "closed", label: "закрыт" },
  { value: "cancelled", label: "отмена" },
] as const

const archivable = new Set(["closed", "delivered", "cancelled"])

export default async function OrdersPage() {
  const orders = await listOrdersForOwner(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">CRM</p>
          <h1 className="display mt-2 text-3xl">Заказы</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Заявки с /services и /order. Оплаты нет — это воронка работ.
          </p>
        </div>
        <Link href="/dashboard/orders/archive" className="text-xs tracking-[0.14em] text-cyan uppercase no-underline">
          Архив →
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id} className="glass rounded-[1.4rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{order.name}</p>
                <p className="text-xs text-muted">
                  {order.email} · {order.createdAt.slice(0, 10)} · {order.serviceTitle || "Индивидуальный запрос"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={updateOrderStatusAction} className="flex gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-full border border-line bg-black/30 px-3 py-2 text-xs"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button className="glass-btn glass-btn-ghost" type="submit">
                    OK
                  </button>
                </form>
                {archivable.has(order.status) ? (
                  <form action={archiveOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <button className="glass-btn glass-btn-ghost" type="submit">
                      В архив
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{order.message}</p>
          </li>
        ))}
        {orders.length === 0 ? (
          <p className="text-sm text-muted">Заказов пока нет. Форма на /order пишет сюда.</p>
        ) : null}
      </ul>
    </div>
  )
}
