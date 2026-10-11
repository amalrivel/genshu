"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";

const authClient = createAuthClient();

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }
  return <Button type="button" variant="outline" size="sm" onClick={logout} disabled={pending}>
    {pending ? "Signing out…" : "Sign out"}
  </Button>;
}
