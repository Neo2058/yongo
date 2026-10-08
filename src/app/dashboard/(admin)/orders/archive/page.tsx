import Link from "next/link"
import { deleteArchivedOrderAction } from "@/app/actions/orders"
import { listOrdersForOwner } from "@/data/orders"

export const metadata = { title: "Архив заказов" }

export default async function OrdersArchivePage() {
  const orders = await listOrdersForOwner(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Archive</p>
          <h1 className="display mt-2 text-3xl">Архив заказов</h1>
        </div>
        <Link href="/dashboard/orders" className="text-xs tracking-[0.14em] text-cyan uppercase no-underline">
          ← К заказам
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
              <form action={deleteArchivedOrderAction}>
                <input type="hidden" name="id" value={order.id} />
                <button className="glass-btn glass-btn-ghost" type="submit">
                  Удалить
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{order.message}</p>
          </li>
        ))}
        {orders.length === 0 ? <p className="text-sm text-muted">Архив пуст.</p> : null}
      </ul>
    </div>
  )
}
