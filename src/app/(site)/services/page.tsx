import type { Metadata } from "next"
import Link from "next/link"
import { listPublishedShopServices } from "@/data/content"
import { ServiceCard } from "@/ui/service-card"

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Доработка сайтов, формы заявок, Laravel и административные панели. Запуск и сопровождение веб-проектов.",
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ ordered?: string }>
}) {
  const services = await listPublishedShopServices()
  const ordered = (await searchParams).ordered === "1"

  return (
    <div className="flex flex-col gap-6">
      {ordered ? (
        <p className="glass rounded-full px-5 py-3 text-sm text-cyan">
          Спасибо! Запрос получен. Я отвечу на указанную почту.
        </p>
      ) : null}
      <section className="glass rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="kicker">С чем могу помочь</p>
        <h1 className="display mt-4 text-4xl sm:text-6xl">
          Услуги
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Выберите подходящее направление или опишите задачу своими словами.
          Объём, стоимость и срок согласуем после знакомства с вашим проектом.
        </p>
        <Link href="/order" className="glass-btn glass-btn-primary mt-8">
          Индивидуальный запрос →
        </Link>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.slug} post={service} />
        ))}
      </section>
      {services.length === 0 ? (
        <p className="text-sm text-muted">Каталог пока пуст. Можно отправить индивидуальный запрос.</p>
      ) : null}
    </div>
  )
}
