import Link from "next/link"
import { deleteContentAction } from "@/app/actions/content"
import { listContentsForOwner } from "@/data/content"

export const metadata = { title: "Услуги — админка" }

export default async function ServicesAdminPage() {
  const services = await listContentsForOwner("shop")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Shop channel</p>
          <h1 className="display mt-2 text-3xl">Услуги</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Карточки с канала shop. Опубликованные видны на /services и их
            можно заказать.
          </p>
        </div>
        <Link href="/dashboard/services/new" className="glass-btn glass-btn-primary">
          Новая услуга
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {services.map((service) => (
          <li
            key={service.id}
            className="glass flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] px-5 py-4"
          >
            <div>
              <p className="font-medium">{service.title}</p>
              <p className="text-xs text-muted">
                {service.status} · {service.slug}
                {service.featured ? " · избранное" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/services/${service.id}`} className="glass-btn glass-btn-ghost">
                Править
              </Link>
              <form action={deleteContentAction}>
                <input type="hidden" name="id" value={service.id} />
                <button className="glass-btn glass-btn-ghost" type="submit">
                  Удалить
                </button>
              </form>
            </div>
          </li>
        ))}
        {services.length === 0 ? <p className="text-sm text-muted">Каталог пуст.</p> : null}
      </ul>
    </div>
  )
}
