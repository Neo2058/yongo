import Link from "next/link"
import { deleteContentAction } from "@/app/actions/content"
import { listContentsForOwner } from "@/data/content"

export const metadata = { title: "Закрытый журнал" }

export default async function JournalListPage() {
  const posts = await listContentsForOwner("internal")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">Internal channel</p>
          <h1 className="display mt-2 text-3xl">Закрытый журнал</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Эти записи не попадают в открытый блог. Читать их руководители
            смогут после инвайтов — сейчас видишь только ты.
          </p>
        </div>
        <Link href="/dashboard/journal/new" className="glass-btn glass-btn-primary">
          Новая запись
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
              <Link href={`/dashboard/journal/${post.id}`} className="glass-btn glass-btn-ghost">
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
        {posts.length === 0 ? <p className="text-sm text-muted">Журнал пуст.</p> : null}
      </ul>
    </div>
  )
}
