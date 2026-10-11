import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type AccountRole = "student" | "teacher" | "admin";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireManagement() {
  const session = await requireUser();
  const role = (session.user as typeof session.user & { role?: string }).role;
  if (role !== "teacher" && role !== "admin") redirect("/");
  return { ...session, user: { ...session.user, role } };
}

export async function requireAdmin() {
  const session = await requireUser();
  if ((session.user as typeof session.user & { role?: string }).role !== "admin") redirect("/");
  return session;
}
