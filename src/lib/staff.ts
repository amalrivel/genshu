import "server-only"
import { notFound, redirect } from "next/navigation"
import { createAuthClient } from "@/lib/supabase/server"
import { database } from "@/lib/content-repository"

export type StaffMember = { userId: string; role: "SENSEI" | "TANTOSHA"; displayName: string }

export async function currentStaff(): Promise<StaffMember | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null
  const client = await createAuthClient()
  const { data, error } = await client.auth.getClaims()
  if (error || !data?.claims?.sub) return null
  const rows = await database()`
    select user_id::text as "userId", role, display_name as "displayName"
    from staff_members where user_id = ${data.claims.sub}::uuid and is_active = true limit 1
  `
  return (rows[0] as StaffMember | undefined) ?? null
}

export async function requireStaff() {
  const staff = await currentStaff()
  if (!staff) redirect("/login")
  return staff
}

export async function requireSensei() {
  const staff = await requireStaff()
  if (staff.role !== "SENSEI") notFound()
  return staff
}
