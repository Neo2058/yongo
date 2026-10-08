import type { ReactNode } from "react"
import { SiteFooter } from "@/ui/site-footer"
import { SiteHeader } from "@/ui/site-header"

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
