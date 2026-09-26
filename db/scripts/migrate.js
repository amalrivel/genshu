import { readdir } from "node:fs/promises"
import { resolve } from "node:path"

const configuredUrl = process.env.POSTGRES_URL
if (!configuredUrl) throw new Error("POSTGRES_URL belum diatur.")
const parsedUrl = new URL(configuredUrl)
parsedUrl.searchParams.delete("schema")
const connectionString = parsedUrl.toString()

async function psql(args) {
  const child = Bun.spawn(["psql", connectionString, "-X", "-v", "ON_ERROR_STOP=1", ...args], {
    stdout: "inherit",
    stderr: "inherit",
  })
  const code = await child.exited
  if (code !== 0) throw new Error(`psql gagal dengan kode ${code}`)
}

await psql(["-c", "create table if not exists genshu_schema_migrations (name text primary key, applied_at timestamptz not null default now())"])
await psql(["-c", "alter table genshu_schema_migrations enable row level security; revoke all on genshu_schema_migrations from public"])
await psql(["-c", `do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke all on genshu_schema_migrations from anon; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then revoke all on genshu_schema_migrations from authenticated; end if;
end $$`])
const folder = resolve(import.meta.dir, "../migrations")
const migrations = (await readdir(folder)).filter((name) => /^\d{3}_[\w.-]+\.sql$/.test(name)).sort()

for (const name of migrations) {
  const check = Bun.spawn(["psql", connectionString, "-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", `select 1 from genshu_schema_migrations where name = '${name}'`], { stdout: "pipe", stderr: "inherit" })
  const applied = (await new Response(check.stdout).text()).trim()
  const checkCode = await check.exited
  if (checkCode !== 0) throw new Error(`Tidak dapat membaca status migrasi ${name}`)
  if (applied) {
    console.log(`skip ${name} (sudah diterapkan)`)
    continue
  }
  const path = resolve(folder, name)
  console.log(`apply ${name}`)
  await psql(["-1", "-f", path, "-c", `insert into genshu_schema_migrations (name) values ('${name}')`])
}
