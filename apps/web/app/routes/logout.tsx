import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { api } from "../content-api";

export async function clientAction({}: Route.ClientActionArgs) {
  await api("/auth/logout", { method: "POST" });
  return redirect("/login");
}
export default function Logout() { return null; }
