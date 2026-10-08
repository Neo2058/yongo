export const site = {
  name: "Yongo",
  role: "Веб-разработчик · Laravel / JavaScript / Next.js",
  description: "Разработка и доработка сайтов и бизнес-приложений: формы заявок, административные панели и автоматизация рабочих процессов. Laravel, JavaScript, Next.js.",
  availability: "Доступен для проектной работы · 15–20 часов в неделю",
  languages: "Русский · English · Deutsch · Français",
} as const

export const nav = [
  { href: "/services", label: "Услуги" },
  { href: "/work", label: "Проекты" },
  { href: "/about", label: "Обо мне" },
  { href: "/blog", label: "Блог" },
  { href: "/contact", label: "Контакты" },
] as const

export const stats = [
  { value: "2", label: "Коммерческих проекта запущены" },
  { value: "≈25", label: "Пользователей ARM ежедневно" },
  { value: "От идеи", label: "До запуска и сопровождения" },
] as const
