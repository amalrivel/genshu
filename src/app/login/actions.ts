"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { database } from "@/lib/content-repository"

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) redirect("/login?error=invalid")
  const client = await createClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.user?.id) redirect("/login?error=invalid")
  const rows = await database()`
    select user_id from staff_members where user_id = ${data.user.id}::uuid and is_active = true limit 1
  `
  if (!rows.length) {
    await client.auth.signOut({ scope: "local" })
    redirect("/login?error=forbidden")
  }
  redirect("/staff")
}

export async function signOut() {
  const client = await createClient()
  await client.auth.signOut({ scope: "local" })
  redirect("/login")
}
