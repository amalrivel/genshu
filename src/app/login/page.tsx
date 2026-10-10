// NOTE: This route currently renders the unconnected login form.
// TODO: Complete session-aware login and expiry handling; public signup is disabled in v1.
// See docs/developer-guide.md, Login and account access.

import { LoginForm } from "@/components/login/login-form"

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
