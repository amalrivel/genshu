import { provisionAccount, resetAccountPassword, updateAccount } from "@/lib/admin/actions";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { AdminField, ManagementForm, RecordEditor } from "./management-form";
import { AccountDeleteControls } from "./account-delete-controls";

export function StudentAccountForm({ accounts }: { accounts: { id: string; name: string; email: string; role: string }[] }) {
  return <section className="page-stack">
    <RecordEditor title="Tambah akun" description="Akun disediakan oleh administrator. Siswa tidak perlu mendaftar sendiri." create><ManagementForm action={provisionAccount} submitLabel="Buat akun" resetOnSuccess><FieldGroup>
      <AdminField name="name" label="Nama"><Input required maxLength={120} autoComplete="name" /></AdminField>
      <AdminField name="email" label="Email"><Input type="email" required maxLength={254} autoComplete="email" /></AdminField>
      <AdminField name="password" label="Kata sandi sementara" hint="Minimal 12 karakter. Berikan melalui saluran yang aman."><Input type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></AdminField>
      <AdminField name="role" label="Peran"><NativeSelect defaultValue="student"><option value="student">Siswa</option><option value="teacher">Guru</option></NativeSelect></AdminField>
    </FieldGroup></ManagementForm></RecordEditor>
    {accounts.length ? <ul className="flex flex-col gap-3">{accounts.map((account) => <li key={account.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{account.name}</h3><Badge variant="secondary">{{ admin: "Admin", teacher: "Guru", student: "Siswa" }[account.role] ?? account.role}</Badge></div><p className="break-all text-sm text-muted-foreground">{account.email}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        {account.role === "student" || account.role === "teacher" ? <>
          <RecordEditor title={`Ubah akun ${account.name}`} triggerLabel="Ubah akun" description="Simpan perubahan nama, email, atau peran akun. Perubahan email atau peran akan mengakhiri semua sesi akun ini; pengguna perlu masuk kembali."><ManagementForm action={updateAccount} submitLabel="Simpan perubahan"><FieldGroup>
            <input type="hidden" name="userId" value={account.id} />
            <AdminField name="name" label="Nama"><Input required maxLength={120} autoComplete="name" defaultValue={account.name} /></AdminField>
            <AdminField name="email" label="Email"><Input type="email" required maxLength={254} autoComplete="email" defaultValue={account.email} /></AdminField>
            <AdminField name="role" label="Peran"><NativeSelect required defaultValue={account.role}><option value="student">Siswa</option><option value="teacher">Guru</option></NativeSelect></AdminField>
          </FieldGroup></ManagementForm></RecordEditor>
          <AccountDeleteControls id={account.id} name={account.name} email={account.email} />
        </> : <p className="max-w-prose text-sm text-muted-foreground">Akun administrator dilindungi dari perubahan profil/peran dan penghapusan.</p>}
        <RecordEditor title={`Kata sandi ${account.name}`} triggerLabel="Ganti kata sandi" description="Mengganti kata sandi akan mengakhiri semua sesi akun ini. Pengguna perlu masuk kembali."><ManagementForm action={resetAccountPassword} submitLabel="Ganti kata sandi"><FieldGroup><input type="hidden" name="userId" value={account.id} /><AdminField name="password" label="Kata sandi sementara baru" hint="Minimal 12 karakter."><Input type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></AdminField></FieldGroup></ManagementForm></RecordEditor>
      </div>
    </li>)}</ul> : <CollectionEmpty title="Akun tidak ditemukan" description="Tambahkan akun baru atau ubah kata pencarian." />}
  </section>;
}
