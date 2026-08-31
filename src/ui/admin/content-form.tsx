"use client"

import { useActionState } from "react"
import type { ContentDTO } from "@/data/content"
import { saveContentAction, type ContentState } from "@/app/actions/content"

export function ContentForm({
  post,
  defaultChannel,
}: {
  post?: ContentDTO
  defaultChannel: "public" | "internal"
}) {
  const [state, action, pending] = useActionState(saveContentAction, undefined as ContentState)
  const channel = post?.channel ?? defaultChannel

  return (
    <form action={action} className="glass flex flex-col gap-5 rounded-[1.6rem] p-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="cover" value={post?.cover ?? ""} />

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Заголовок
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Slug
          <input
            name="slug"
            defaultValue={post?.slug}
            placeholder="из заголовка"
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Kicker
          <input
            name="kicker"
            defaultValue={post?.kicker}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Коротко
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Текст (markdown: абзацы, ## заголовок, - список, ![alt](/media/...))
        <textarea
          name="body"
          rows={16}
          required
          defaultValue={post?.body}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 font-mono text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Обложка
          <input
            name="coverFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm text-foreground normal-case"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Alt обложки
          <input
            name="coverAlt"
            defaultValue={post?.coverAlt}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
          />
        </label>
      </div>

      {post?.cover ? (
        <p className="text-xs text-muted">
          Текущая обложка: {post.cover}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Теги через запятую
        <input
          name="tags"
          defaultValue={post?.tags.join(", ")}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Канал
          <select
            name="channel"
            defaultValue={channel}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none"
          >
            <option value="public">Открытый блог</option>
            <option value="internal">Закрытый журнал</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Тип
          <select
            name="type"
            defaultValue={post?.type ?? (defaultChannel === "internal" ? "briefing" : "article")}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none"
          >
            <option value="article">Статья</option>
            <option value="briefing">Briefing</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Статус
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none"
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">Архив</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-muted">
        <input type="checkbox" name="featured" defaultChecked={post?.featured} />
        Показать в избранном на главной (только public)
      </label>

      {state?.error ? <p className="text-sm text-red-300">{state.error}</p> : null}

      <button
        className="glass-btn glass-btn-primary self-start"
        disabled={pending}
        type="submit"
        id="content-save"
      >
        {pending ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  )
}
