import { redirect } from "next/navigation"
import { getSessionUser } from "@/data/auth"
import { LoginForm } from "@/ui/admin/login-form"
import { gateLoginAction } from "@/app/actions/auth"

export const metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
}

export default async function GatePage() {
  const user = await getSessionUser()
  if (user?.role === "owner") redirect("/dashboard")
  if (user?.role === "manager") redirect("/briefing")

  return (
    <div className="site-shell flex min-h-dvh items-center justify-center px-4 py-16">
      <section className="glass w-full max-w-md rounded-[2rem] p-8">
        <p className="kicker">Briefing</p>
        <h1 className="display mt-4 text-3xl">Закрытый контур</h1>
        <p className="mt-3 text-sm text-muted">
          Вход для приглашённых руководителей. Сначала ссылка-приглашение, затем
          этот адрес.
        </p>
        <LoginForm actionFn={gateLoginAction} submitLabel="Войти в брифинг" />
      </section>
    </div>
  )
}
