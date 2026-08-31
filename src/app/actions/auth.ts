"use server"

import { redirect } from "next/navigation"
import { loginOwner, logoutOwner, requireOwner } from "@/data/auth"

export type AuthState = { error?: string } | undefined

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const result = await loginOwner(email, password)
  if (!result.ok) return { error: result.error }
  redirect("/dashboard")
}

export async function logoutAction() {
  const owner = await requireOwner()
  if (!owner) redirect("/dashboard/login")
  await logoutOwner()
  redirect("/dashboard/login")
}
