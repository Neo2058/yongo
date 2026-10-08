"use server"

import { redirect } from "next/navigation"
import { loginOwner, loginUser, logoutSession } from "@/data/auth"

export type AuthState = { error?: string } | undefined

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const result = await loginOwner(email, password)
  if (!result.ok) return { error: result.error }
  redirect("/dashboard")
}

export async function gateLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const result = await loginUser(email, password)
  if (!result.ok) return { error: result.error }
  if (result.role === "owner") redirect("/dashboard")
  redirect("/briefing")
}

export async function logoutAction() {
  await logoutSession()
  redirect("/")
}
