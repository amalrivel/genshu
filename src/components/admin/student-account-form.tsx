import { provisionAccount, resetAccountPassword } from "@/lib/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function StudentAccountForm({ accounts }: { accounts: { id: string; name: string; email: string; role: string }[] }) {
  return <Card>
    <CardHeader><CardTitle>Managed accounts</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      <form action={provisionAccount}>
        <FieldGroup>
          <Field><FieldLabel htmlFor="account-name">Name</FieldLabel><Input id="account-name" name="name" required maxLength={120} /></Field>
          <Field><FieldLabel htmlFor="account-email">Email</FieldLabel><Input id="account-email" name="email" type="email" required maxLength={254} /></Field>
          <Field><FieldLabel htmlFor="account-password">Temporary password</FieldLabel><Input id="account-password" name="password" type="password" minLength={12} required autoComplete="new-password" /></Field>
          <Field><FieldLabel htmlFor="account-role">Role</FieldLabel><select id="account-role" name="role" className="h-9 rounded-md border bg-background px-3" defaultValue="student"><option value="student">Student</option><option value="teacher">Teacher</option></select></Field>
          <Button type="submit">Create account</Button>
        </FieldGroup>
      </form>
      <ul className="divide-y">
        {accounts.map((account) => <li key={account.id} className="space-y-2 py-3">
          <p className="font-medium">{account.name} <span className="text-sm text-muted-foreground">({account.role})</span></p>
          <p className="text-sm text-muted-foreground">{account.email}</p>
          <form action={resetAccountPassword} className="flex flex-wrap gap-2">
            <input type="hidden" name="userId" value={account.id} />
            <label className="sr-only" htmlFor={`reset-${account.id}`}>New password for {account.name}</label>
            <Input id={`reset-${account.id}`} name="password" type="password" minLength={12} required autoComplete="new-password" placeholder="New temporary password" className="max-w-xs" />
            <Button type="submit" variant="outline">Set password</Button>
          </form>
        </li>)}
      </ul>
    </CardContent>
  </Card>;
}
