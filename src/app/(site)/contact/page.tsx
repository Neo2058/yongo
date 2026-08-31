import type { Metadata } from "next"
import { ContactForm } from "@/ui/contact-form"

export const metadata: Metadata = {
  title: "Контакт",
  description: "Заявка на разработку сайта, сервера, realtime или связки веб + UE5.",
}

export default function ContactPage() {
  return (
    <section className="glass mx-auto max-w-3xl rounded-[2rem] px-6 py-12 sm:px-10">
      <p className="kicker">Let&apos;s talk</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">Заявка</h1>
      <p className="mt-4 leading-7 text-muted">
        Заявка пишется в базу, не в письмо. Опишите, что собрать: веб, бэкенд,
        сервер, UE5, срок.
      </p>
      <ContactForm />
    </section>
  )
}
