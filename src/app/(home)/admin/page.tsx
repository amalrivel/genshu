import type { Metadata } from "next";
import { StudentAccountForm } from "@/components/admin/student-account-form";
import { MaterialImportForm } from "@/components/admin/material-import-form";
import { ContentManager } from "@/components/admin/content-manager";
import { getManagedAccounts, getManagementContent } from "@/lib/admin/queries";
import { requireManagement } from "@/lib/auth-session";

export const metadata: Metadata = { title: "Management", description: "Manage Genshu accounts and published learning content." };

export default async function AdminPage() {
  const session = await requireManagement();
  const role = (session.user as typeof session.user & { role?: string }).role;
  const [content, accounts] = await Promise.all([
    getManagementContent(),
    role === "admin" ? getManagedAccounts() : Promise.resolve(null),
  ]);
  return <section className="space-y-8">
    <header><h1 className="text-2xl font-semibold">Management</h1><p className="text-muted-foreground">Save changes as drafts, review them, then publish.</p></header>
    {accounts ? <StudentAccountForm accounts={accounts} /> : null}
    <section className="space-y-3"><h2 className="text-xl font-semibold">Learning materials</h2>
      <MaterialImportForm
        subjects={content.subjects.map((subject) => ({ id: subject.id, title: subject.title, topic: subject.topic }))}
        drafts={content.materialDrafts.map((draft) => ({ ...draft, subject: draft.subject }))}
      />
    </section>
    <ContentManager content={content} />
  </section>;
}
