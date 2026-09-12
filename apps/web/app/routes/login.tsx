import { Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "./+types/login";
import { api, ApiError, currentUser } from "../content-api";

export const meta = () => [{ title: "Log in · Genshu" }];
export async function clientLoader() { try { await currentUser(); return redirect("/practice"); } catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error; } }
export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  try { await api("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); return redirect("/practice"); }
  catch (error) { return { error: error instanceof Error ? error.message : "Unable to log in." }; }
}
export default function Login() {
  const data = useActionData<typeof clientAction>();
  return <main className="content-admin"><h1>Log in</h1><Form method="post" className="content-form"><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button type="submit">Log in</button>{data?.error && <p role="alert">{data.error}</p>}</Form><p>Use an invitation link to set your first password.</p><Link to="/">Home</Link></main>;
}
