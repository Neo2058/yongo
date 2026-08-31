import Link from "next/link"

export function ComingSoon({
  title,
  lead,
}: {
  title: string
  lead: string
}) {
  return (
    <section className="glass mx-auto max-w-3xl rounded-[2rem] px-6 py-16 text-center sm:px-12">
      <p className="kicker justify-center">In progress</p>
      <h1 className="display mt-5 text-4xl sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-muted">{lead}</p>
      <Link href="/blog" className="glass-btn glass-btn-primary mt-8">
        Читать блог
      </Link>
    </section>
  )
}
