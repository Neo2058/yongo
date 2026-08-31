export const site = {
  name: "Yongo",
  role: "Full-stack & systems",
  description:
    "Публичный блог о сборке систем: React, Next.js, Nest.js, PHP, Unreal Engine 5, C++, 3D и инфраструктура с нуля.",
} as const

export const nav = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const

export const stats = [
  { value: "8+", label: "Слоёв стека" },
  { value: "3", label: "Контура систем" },
  { value: "UE5", label: "Realtime" },
  { value: "VPS", label: "Сервер с нуля" },
] as const

export const skills = [
  { name: "React / Next.js", value: 90 },
  { name: "Nest.js / PHP", value: 86 },
  { name: "UE5 / C++", value: 82 },
  { name: "3ds Max / Blender", value: 80 },
  { name: "Linux / Docker", value: 88 },
  { name: "HTML / CSS / JS", value: 94 },
] as const

export const stack = [
  { name: "React", mark: "R" },
  { name: "Next.js", mark: "N" },
  { name: "Nest.js", mark: "Ne" },
  { name: "PHP", mark: "P" },
  { name: "UE5", mark: "U" },
  { name: "C++", mark: "C+" },
  { name: "Docker", mark: "D" },
  { name: "TypeScript", mark: "TS" },
] as const
