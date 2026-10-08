import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { logoutAction } from "@/app/actions/auth"
import { requireBriefingUser } from "@/data/auth"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function BriefingLayout({ children }: { children: ReactNode }) {
  const user = await requireBriefingUser()
  if (!user) notFound()

  return (
    <div className="site-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Link href="/briefing" className="display text-sm tracking-[0.18em] uppercase no-underline">
            Briefing
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">{user.name || user.email}</span>
            <form action={logoutAction}>
              <button className="glass-btn glass-btn-ghost" type="submit">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
