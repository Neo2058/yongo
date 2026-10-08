import { revokeInviteAction } from "@/app/actions/invites"
import { listInvitesForOwner } from "@/data/invites"
import { InviteForm } from "@/ui/admin/invite-form"

export const metadata = { title: "Доступ руководителей" }

export default async function AccessPage() {
  const invites = await listInvitesForOwner()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="kicker">Managers</p>
        <h1 className="display mt-2 text-3xl">Приглашения</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Создайте ссылку и перешлите руководителю. Ссылка одноразовая: по ней
          задают пароль. Доступ действует, пока вы не нажмёте «Отозвать доступ».
          Неверный токен выглядит как 404.
        </p>
      </div>
      <InviteForm />
      <ul className="flex flex-col gap-3">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="glass flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] px-5 py-4"
          >
            <div>
              <p className="font-medium">
                {invite.name} · {invite.email}
              </p>
              <p className="text-xs text-muted">
                {invite.status === "pending"
                  ? "ожидает активации"
                  : invite.status === "active"
                    ? "доступ выдан"
                    : "отозвано"}
              </p>
            </div>
            {invite.status !== "revoked" ? (
              <form action={revokeInviteAction}>
                <input type="hidden" name="id" value={invite.id} />
                <button className="glass-btn glass-btn-ghost" type="submit">
                  Отозвать доступ
                </button>
              </form>
            ) : null}
          </li>
        ))}
        {invites.length === 0 ? (
          <p className="text-sm text-muted">Пока нет приглашений. Создайте два.</p>
        ) : null}
      </ul>
    </div>
  )
}
