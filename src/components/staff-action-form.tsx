"use client"
import { useActionState, type ReactNode } from "react"

export type StaffFormState = { error: string } | null

export function StaffActionForm({ action, submitLabel, children }: {
  action: (state: StaffFormState, formData: FormData) => Promise<StaffFormState>
  submitLabel: string
  children: ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return <form action={formAction} className="mt-8 space-y-5" aria-busy={pending}>
    {state?.error && <p role="alert" className="rounded-md border border-destructive px-4 py-3 text-sm text-destructive">{state.error}</p>}
    {children}
    <button disabled={pending} className="min-h-11 rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground disabled:opacity-60">{submitLabel}</button>
  </form>
}
