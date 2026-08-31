import { redirect } from "next/navigation"
import { getSessionUser } from "@/data/auth"
import { LoginForm } from "@/ui/admin/login-form"

export const metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user?.role === "owner") redirect("/dashboard")

  return (
    <div className="site-shell flex min-h-full items-center justify-center px-4 py-16">
      <section className="glass w-full max-w-md rounded-[2rem] p-8">
        <p className="kicker">Owner</p>
        <h1 className="display mt-4 text-3xl">Админка</h1>
        <p className="mt-3 text-sm text-muted">
          Вход только для владельца. Регистрации нет.
        </p>
        <LoginForm />
      </section>
    </div>
  )
}
