import Link from "next/link"
import { deleteContentAction } from "@/app/actions/content"
import { listContentsForOwner } from "@/data/content"

export const metadata = { title: "Блог — админка" }

export default async function ContentListPage() {
  const posts = (await listContentsForOwner("public"))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Public channel</p>
          <h1 className="display mt-2 text-3xl">Открытый блог</h1>
        </div>
        <Link href="/dashboard/content/new" className="glass-btn glass-btn-primary">
          Новая статья
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li key={post.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] px-5 py-4">
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-xs text-muted">
                {post.status} · {post.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/content/${post.id}`} className="glass-btn glass-btn-ghost">
                Править
              </Link>
              <form action={deleteContentAction}>
                <input type="hidden" name="id" value={post.id} />
                <button className="glass-btn glass-btn-ghost" type="submit">
                  Удалить
                </button>
              </form>
            </div>
          </li>
        ))}
        {posts.length === 0 ? <p className="text-sm text-muted">Пока пусто.</p> : null}
      </ul>
    </div>
  )
}
