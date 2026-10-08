"use client"

import { useEffect } from "react"
import "./globals.css"

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error.digest ?? "global-error")
  }, [error])

  return (
    <html lang="ru">
      <body className="flex min-h-dvh flex-col bg-[#030918] text-white">
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16">
          <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 px-8 py-14 text-center">
            <title>Ошибка · Yongo</title>
            <p className="text-6xl text-white/20">500</p>
            <h1 className="mt-4 text-3xl">Что-то сломалось</h1>
            <p className="mt-3 text-white/60">Страница не открылась. Можно попробовать ещё раз.</p>
            {error.digest ? <p className="mt-2 text-xs text-white/40">{error.digest}</p> : null}
            <button
              className="mt-8 rounded-full border border-white/20 px-5 py-2 text-sm"
              type="button"
              onClick={() => unstable_retry()}
            >
              Повторить
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
