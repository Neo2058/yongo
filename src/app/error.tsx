"use client"

import { useEffect } from "react"

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error.digest ?? "client-error")
  }, [error])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-16 sm:px-6">
      <section className="glass mx-auto max-w-xl rounded-[2rem] px-8 py-14 text-center">
        <p className="display text-6xl text-white/20">500</p>
        <h1 className="display mt-4 text-3xl">Что-то сломалось</h1>
        <p className="mt-3 text-muted">Страница не открылась. Можно попробовать ещё раз.</p>
        {error.digest ? <p className="mt-2 text-xs text-muted">{error.digest}</p> : null}
        <button className="glass-btn glass-btn-primary mt-8" type="button" onClick={() => unstable_retry()}>
          Повторить
        </button>
      </section>
    </main>
  )
}
