import type { Metadata } from "next"
import { listPublishedShopServices } from "@/data/content"
import { OrderForm } from "@/ui/order-form"

export const metadata: Metadata = {
  title: "Обсудить задачу",
  description: "Заявка на разработку системы. Без оплаты на сайте.",
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const selected = (await searchParams).service ?? ""
  const services = await listPublishedShopServices()

  return (
    <section className="glass mx-auto max-w-3xl rounded-[2rem] px-6 py-12 sm:px-10">
      <p className="kicker">Начало работы</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Обсудить задачу</h1>
      <p className="mt-4 leading-7 text-muted">
        Расскажите, что нужно исправить или создать, и укажите желаемый срок.
        После уточнения деталей согласуем объём, стоимость и порядок работы.
      </p>
      <OrderForm
        services={services.map((item) => ({ slug: item.slug, title: item.title }))}
        selected={services.some((item) => item.slug === selected) ? selected : ""}
      />
    </section>
  )
}
