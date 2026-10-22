import { expect, test } from "bun:test";

test("account management offers profile and deletion controls only for managed roles", () => {
  const root = new URL("..", import.meta.url).pathname;
  const rendered = Bun.spawnSync([process.execPath, "--eval", `
    import { mock } from "bun:test";
    import { createElement } from "react";
    import { renderToStaticMarkup } from "react-dom/server";
    mock.module(${JSON.stringify(`${root}src/lib/admin/actions.ts`)}, () => Object.fromEntries([
      "provisionAccount", "resetAccountPassword", "updateAccount", "deleteAccount",
    ].map(name => [name, async () => ({success:true})])));
    // Expose portal copy here; focus and cancel are covered in browser QA.
    mock.module(${JSON.stringify(`${root}src/components/ui/alert-dialog.tsx`)}, () => {
      const shell = ({children}) => createElement("div", null, children);
      const trigger = ({children,render}) => createElement("button", {"aria-label":render.props["aria-label"]}, children);
      return Object.fromEntries(["AlertDialog", "AlertDialogContent", "AlertDialogHeader", "AlertDialogTitle", "AlertDialogDescription", "AlertDialogFooter", "AlertDialogCancel", "AlertDialogAction"].map(name=>[name,shell]).concat([["AlertDialogTrigger",trigger]]));
    });
    const { StudentAccountForm } = await import(${JSON.stringify(`${root}src/components/admin/student-account-form.tsx`)});
    const output={};
    for(const role of ["student","teacher","admin","unknown"]) output[role]=renderToStaticMarkup(createElement(StudentAccountForm,{accounts:[{id:role,name:"Akun fixture",email:"fixture@example.invalid",role}]}));
    console.log(JSON.stringify(output));
  `], { cwd: root });
  expect(rendered.exitCode).toBe(0);
  expect(rendered.stderr.toString()).toBe("");
  const html: Record<string, string> = JSON.parse(rendered.stdout.toString());
  for (const role of ["student", "teacher"]) {
    expect(html[role]).toContain("Ubah akun");
    expect(html[role]).toContain('aria-label="Hapus akun Akun fixture"');
    expect(html[role]).toContain("fixture@example.invalid");
    expect(html[role]).toContain("data masuk dan semua sesinya");
    expect(html[role]).toContain("pengerjaan atau hasil latihan tidak dapat dihapus");
  }
  for (const role of ["admin", "unknown"]) {
    expect(html[role]).not.toContain("Ubah akun");
    expect(html[role]).not.toContain('aria-label="Hapus akun');
    expect(html[role]).toContain("dilindungi dari perubahan profil/peran dan penghapusan");
    expect(html[role]).toContain("Ganti kata sandi");
  }
});
