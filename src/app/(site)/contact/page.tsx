import type { Metadata } from "next"
import { ContactForm } from "@/ui/contact-form"

export const metadata: Metadata = {
  title: "Контакт",
  description: "Обсудить разработку или доработку сайта и бизнес-приложения.",
}

export default function ContactPage() {
  return (
    <section className="glass mx-auto max-w-3xl rounded-[2rem] px-6 py-12 sm:px-10">
      <p className="kicker">Связаться</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Заявка</h1>
      <p className="mt-4 leading-7 text-muted">
        Опишите задачу, желаемый срок и приложите ссылку на сайт, если он уже есть.
        Я отвечу на указанную почту, чтобы обсудить детали.
      </p>
      <ContactForm />
    </section>
  )
}
