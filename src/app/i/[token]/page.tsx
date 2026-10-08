import { notFound } from "next/navigation"
import { getPendingInvite } from "@/data/invites"
import { AcceptForm } from "@/ui/gate/accept-form"

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export const metadata = {
  title: "Приглашение",
  robots: { index: false, follow: false },
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const invite = await getPendingInvite(token)
  if (!invite) notFound()

  return (
    <div className="site-shell flex min-h-dvh items-center justify-center px-4 py-16">
      <section className="glass w-full max-w-md rounded-[2rem] p-8">
        <p className="kicker">Invite</p>
        <h1 className="display mt-4 text-3xl">Доступ к брифингу</h1>
        <AcceptForm token={token} email={invite.email} name={invite.name} />
      </section>
    </div>
  )
}
