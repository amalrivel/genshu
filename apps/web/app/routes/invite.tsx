import { Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "./+types/invite";
import { api } from "../content-api";

type TokenStatus = {
  valid: boolean;
  email?: string;
  name?: string | null;
  expiresAt?: string;
};
export const meta = () => [{ title: "Set password · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return api<TokenStatus>(
    `/auth/invitations/${encodeURIComponent(params.token)}`,
  );
}
export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const form = await request.formData();
  try {
    await api(`/auth/invitations/${encodeURIComponent(params.token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    return redirect("/login");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to set password.",
    };
  }
}
export default function Invite({ loaderData }: Route.ComponentProps) {
  const data = useActionData<typeof clientAction>();
  if (!loaderData.valid)
    return (
      <main className="content-admin">
        <h1>Invitation unavailable</h1>
        <p>This invitation is invalid, used, revoked, or expired.</p>
        <Link to="/login">Log in</Link>
      </main>
    );
  return (
    <main className="content-admin">
      <h1>Set your password</h1>
      <p>
        {loaderData.email} · expires {loaderData.expiresAt}
      </p>
      <Form method="post" className="content-form">
        <label>
          New password
          <input
            name="password"
            type="password"
            minLength={12}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit">Activate account</button>
        {data?.error && <p role="alert">{data.error}</p>}
      </Form>
    </main>
  );
}
