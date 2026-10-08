import type { Metadata } from "next"
import { Manrope, Unbounded } from "next/font/google"
import "./globals.css"
import { site } from "@/content/site"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
})

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
})

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
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body id="top" className="flex min-h-dvh flex-col">
        {children}
      </body>
    </html>
  )
}
