"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  if (!email || !password) redirect("/login?error=invalid")
  const client = await createClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.user?.id) redirect("/login?error=invalid")
  const { data: staff, error: staffError } = await client
    .from("staff_members")
    .select("user_id")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle()
  if (staffError || !staff) {
    await client.auth.signOut({ scope: "local" })
    redirect(staffError ? "/login?error=unavailable" : "/login?error=forbidden")
  }
  redirect("/staff")
}

export async function signOut() {
  const client = await createClient()
  await client.auth.signOut({ scope: "local" })
  redirect("/login")
}
