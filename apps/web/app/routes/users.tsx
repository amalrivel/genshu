import { Form, Link, useActionData } from "react-router";
import type { Route } from "./+types/users";
import { api, requireAdmin, type AuthUser } from "../content-api";

type LinkResult = { url: string; expiresAt: string; message: string };
export const meta = () => [{ title: "Participants · Genshu" }];
export async function clientLoader() { await requireAdmin(); return api<AuthUser[]>("/admin/users"); }
export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData(); const intent = String(form.get("intent"));
  try {
    if (intent === "create") return { ok: true, created: await api<AuthUser>("/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), name: form.get("name") }) }) };
    const id = encodeURIComponent(String(form.get("userId")));
    return { ok: true, result: await api<LinkResult>(`/admin/users/${id}/${intent === "invite" ? "invitations" : "password-resets"}`, { method: "POST" }) };
  } catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Unable to update participant." }; }
}
export default function Users({ loaderData }: Route.ComponentProps) {
  const data = useActionData<typeof clientAction>();
  return <main className="content-admin"><nav><Link to="/">Genshu home</Link></nav><h1>Participants</h1><Form method="post" className="content-form"><fieldset><legend>Create participant</legend><label>Email<input name="email" type="email" required /></label><label>Name (optional)<input name="name" /></label><button name="intent" value="create">Create participant</button></fieldset></Form>{data?.error && <p role="alert">{data.error}</p>}{data?.created && <p role="status">Created {data.created.email}. Generate an invitation below.</p>}{data?.result && <section className="content-form"><h2>Manual message</h2><p>Expires: {data.result.expiresAt}</p><label>URL<input readOnly value={data.result.url} /></label><label>Message<textarea readOnly rows={5} value={data.result.message} /></label></section>}<ul className="content-list">{loaderData.filter((user) => user.role === "Participant").map((user) => <li key={user.id}><h2>{user.email}</h2>{user.name && <p>{user.name}</p>}<Form method="post" className="actions"><input type="hidden" name="userId" value={user.id} /><button name="intent" value="invite">Generate invitation</button><button name="intent" value="reset">Generate reset link</button></Form></li>)}</ul></main>;
}
