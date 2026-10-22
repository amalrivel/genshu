"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function PendingSubmitButton({ pendingLabel, children, disabled, ...props }: ComponentProps<typeof Button> & { pendingLabel: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return <Button {...props} type="submit" disabled={disabled || pending}>
    {pending ? <><Spinner aria-hidden="true" />{pendingLabel}</> : children}
  </Button>;
}
