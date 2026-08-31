import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { requireOwner } from "@/data/auth"
import { ShellNav } from "@/ui/admin/shell-nav"

export const metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const owner = await requireOwner()
  if (!owner) redirect("/dashboard/login")

  return (
    <div className="site-shell mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-6 lg:flex-row">
      <ShellNav email={owner.email} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
