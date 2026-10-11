"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const authClient = createAuthClient();

export function LoginForm({ demoAccounts }: {
  demoAccounts?: { users: { email: string; name: string }[]; password: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await authClient.signIn.email({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    setPending(false);
    if (result.error) {
      setError("Email or password is incorrect. Check your details and try again.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Genshu</CardTitle>
        <CardDescription>Use the email and password provided by your administrator.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signIn}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Field>
            {error ? <p role="alert">{error}</p> : null}
            <Field>
              <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
              <FieldDescription>For account help, contact your Genshu administrator.</FieldDescription>
            </Field>
          </FieldGroup>
        </form>
        {demoAccounts ? (
          <fieldset className="mt-6 space-y-3 border-t pt-4" disabled={pending}>
            <legend className="text-sm font-medium">Testing accounts</legend>
            <p className="text-sm text-muted-foreground">Choose an account to fill the form, then press Sign in. Demo data must already be seeded.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {demoAccounts.users.map((user) => (
                <Button key={user.email} type="button" variant="outline" disabled={pending} onClick={() => {
                  setEmail(user.email);
                  setPassword(demoAccounts.password);
                  setError(null);
                }}>{user.name}</Button>
              ))}
            </div>
          </fieldset>
        ) : null}
      </CardContent>
    </Card>
  );
}
