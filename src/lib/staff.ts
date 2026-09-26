import "server-only"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type StaffMember = { userId: string; role: "SENSEI" | "TANTOSHA"; displayName: string }

export async function currentStaff(): Promise<StaffMember | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null
  const client = await createClient()
  const { data, error } = await client.auth.getClaims()
  if (error || !data?.claims?.sub) return null
  const { data: staff, error: staffError } = await client
    .from("staff_members")
    .select("user_id,role,display_name")
    .eq("user_id", data.claims.sub)
    .eq("is_active", true)
    .maybeSingle()
  if (staffError) throw new Error(`Supabase staff check failed: ${staffError.message}`)
  return staff ? { userId: staff.user_id, role: staff.role as StaffMember["role"], displayName: staff.display_name } : null
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
