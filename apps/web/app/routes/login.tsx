import { Form, Link, redirect, useActionData } from "react-router";
import type { Route } from "./+types/login";
import { api, ApiError, currentUser } from "../content-api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export const meta = () => [{ title: "Log in · Genshu" }];
export async function clientLoader() {
  try {
    await currentUser();
    return redirect("/dashboard");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  try {
    await api("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    return redirect("/dashboard");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to log in.",
    };
  }
}
export default function Login() {
  const data = useActionData<typeof clientAction>();
  return (
    <main className="auth-page">
      <Card className="auth-card">
        <CardHeader>
          <span className="auth-card__brand">Genshu</span>
          <CardTitle>
            <h1>Log in</h1>
          </CardTitle>
          <CardDescription>Continue your Japanese practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="auth-form">
            <label>
              Email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            {data?.error && (
              <p className="form-error" role="alert">
                {data.error}
              </p>
            )}
            <Button size="lg" type="submit">
              Log in
            </Button>
          </Form>
          <p className="muted-copy">
            Use an invitation link to set your first password.
          </p>
          <Link className="muted-copy" to="/">
            Home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
