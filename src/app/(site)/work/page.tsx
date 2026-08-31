import type { Metadata } from "next"
import { ComingSoon } from "@/ui/coming-soon"

export const metadata: Metadata = {
  title: "Работы",
  description: "Кейсы появятся после публичного блога.",
}

export default function WorkPage() {
  return (
    <ComingSoon
      title="Work"
      lead="Кейсы React, Nest, PHP, UE5 и инфраструктуры подключаются после журнала. Пока разбор стека живёт в блоге."
    />
  )
}
