"use client"

import { useActionState } from "react"
import type { ContentDTO } from "@/data/content"
import { saveContentAction, type ContentState } from "@/app/actions/content"

export function ContentForm({
  post,
  defaultChannel,
  initialTitle,
  initialExcerpt,
  initialBody,
  lockPage = false,
}: {
  post?: ContentDTO
  defaultChannel: "public" | "internal" | "shop"
  initialTitle?: string
  initialExcerpt?: string
  initialBody?: string
  lockPage?: boolean
}) {
  const [state, action, pending] = useActionState(saveContentAction, undefined as ContentState)
  const channel = lockPage ? "public" : (post?.channel ?? defaultChannel)
  const type = lockPage
    ? "page"
    : (post?.type ??
      (defaultChannel === "internal" ? "briefing" : defaultChannel === "shop" ? "service" : "article"))

  return (
    <form action={action} className="glass flex flex-col gap-5 rounded-[1.6rem] p-6">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="cover" value={post?.cover ?? ""} />
      {lockPage ? (
        <>
          <input type="hidden" name="slug" value={post?.slug ?? ""} />
          <input type="hidden" name="channel" value="public" />
          <input type="hidden" name="type" value="page" />
        </>
      ) : null}

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Заголовок
        <input
          name="title"
          required
          defaultValue={post?.title ?? initialTitle}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {lockPage ? (
          <p className="text-xs tracking-[0.14em] text-muted uppercase">
            Адрес
            <span className="mt-2 block text-sm tracking-normal text-foreground normal-case">
              /{post?.slug}
            </span>
          </p>
        ) : (
          <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
            Slug
            <input
              name="slug"
              defaultValue={post?.slug}
              placeholder="из заголовка"
              className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
            />
          </label>
        )}
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
          defaultValue={post?.excerpt ?? initialExcerpt}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
        Текст (markdown: абзацы, ## заголовок, - список, ![alt](/media/...))
        <textarea
          name="body"
          rows={16}
          required
          defaultValue={post?.body ?? initialBody}
          className="rounded-2xl border border-line bg-black/30 px-4 py-3 font-mono text-sm text-foreground normal-case outline-none focus:border-cyan"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          Файл в текст (фото, видео, аудио)
          <input
            name="bodyFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4"
            className="text-sm text-foreground normal-case"
          />
        </label>
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

      <div className={`grid gap-4 ${lockPage ? "md:grid-cols-1" : "md:grid-cols-3"}`}>
        {lockPage ? null : (
          <>
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
              Канал
              <select
                name="channel"
                defaultValue={channel}
                className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none"
              >
                <option value="public">Открытый блог</option>
                <option value="internal">Закрытый журнал</option>
                <option value="shop">Услуги</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs tracking-[0.14em] text-muted uppercase">
              Тип
              <select
                name="type"
                defaultValue={type}
                className="rounded-2xl border border-line bg-black/30 px-4 py-3 text-sm text-foreground normal-case outline-none"
              >
                <option value="article">Статья</option>
                <option value="briefing">Briefing</option>
                <option value="service">Услуга</option>
              </select>
            </label>
          </>
        )}
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

      {lockPage ? null : (
        <label className="flex items-center gap-3 text-sm text-muted">
          <input type="checkbox" name="featured" defaultChecked={post?.featured} />
          Показать в избранном на главной
        </label>
      )}

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
