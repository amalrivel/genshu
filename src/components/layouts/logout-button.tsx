"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const authClient = createAuthClient();
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setPending(true); setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      router.replace("/login"); router.refresh();
    } catch { setError(true); }
    finally { setPending(false); }
  }
  return <div className="flex flex-col gap-2"><Button type="button" variant="outline" onClick={logout} disabled={pending}>{pending ? <><Spinner aria-hidden="true" />Keluar…</> : "Keluar"}</Button>{error ? <Alert variant="destructive"><AlertDescription>Belum berhasil keluar. Coba lagi.</AlertDescription></Alert> : null}</div>;
}
