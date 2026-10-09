import "server-only"

import { after } from "next/server"
import nodemailer from "nodemailer"

function mailConfig() {
  const host = process.env.SMTP_HOST?.trim()
  if (!host) return null
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS ?? ""
  const from = process.env.MAIL_FROM?.trim() || user || "noreply@localhost"
  const to = process.env.MAIL_TO?.trim() || process.env.OWNER_EMAIL?.trim()
  if (!to) return null
  return { host, port, user, pass, from, to, secure: port === 465 }
}

async function sendOwnerMail(subject: string, text: string) {
  const config = mailConfig()
  if (!config) {
    console.info("[mail] SMTP не настроен, запись уже в БД.")
    return
  }

  try {
    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: !config.secure,
      connectionTimeout: 10000,
      socketTimeout: 20000,
      auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    })
    await transport.sendMail({
      from: config.from,
      to: config.to,
      subject,
      text,
    })
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown"
    console.error("[mail] не отправилось, запись в БД сохранена. Код:", /^[A-Z0-9_]+$/.test(code) ? code : "unknown")
  }
}

export function notifyOwnerAfter(subject: string, text: string) {
  after(() => sendOwnerMail(subject, text))
}
