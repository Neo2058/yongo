import Link from "next/link"
import { site } from "@/content/site"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-inherit no-underline">
      <span className="relative grid size-9 place-items-center rounded-xl border border-cyan/40 bg-cyan/10">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
          <path
            d="M7 26V6h5.2l7.4 12.4V6H25v20h-5.2L12.4 13.6V26H7Z"
            fill="url(#yongo-mark)"
          />
          <defs>
            <linearGradient id="yongo-mark" x1="7" y1="6" x2="25" y2="26">
              <stop stopColor="#9ef6ff" />
              <stop offset="1" stopColor="#2ec4f3" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="display text-sm font-semibold tracking-[0.18em] uppercase sm:tracking-[0.22em]">
        {site.name}
      </span>
    </Link>
  )
}
