import type { Metadata } from "next"
import "@fontsource-variable/manrope"
import "@fontsource-variable/unbounded"
import "./globals.css"
import { site } from "@/content/site"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: `${site.name} — веб-разработка для бизнеса`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body id="top" className="flex min-h-dvh flex-col">
        {children}
      </body>
    </html>
  )
}
