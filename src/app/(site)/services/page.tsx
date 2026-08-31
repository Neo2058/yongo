import type { Metadata } from "next"
import { ComingSoon } from "@/ui/coming-soon"

export const metadata: Metadata = {
  title: "Услуги",
  description: "Каталог заказов появится вместе с магазином работ.",
}

export default function ServicesPage() {
  return (
    <ComingSoon
      title="Services"
      lead="Магазин заказа работ — отдельный канал CMS. Сначала открытый блог, затем заявки и каталог."
    />
  )
}
