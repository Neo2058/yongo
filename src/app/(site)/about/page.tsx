import type { Metadata } from "next"
import { ComingSoon } from "@/ui/coming-soon"

export const metadata: Metadata = {
  title: "Обо мне",
  description: "Страница обо мне появится после публичного блога.",
}

export default function AboutPage() {
  return (
    <ComingSoon
      title="About"
      lead="Биография и развёрнутый стек будут отдельной страницей. Сейчас позиционирование собрано на главной и в журнале."
    />
  )
}
