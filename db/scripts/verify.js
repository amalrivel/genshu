const configuredUrl = process.env.POSTGRES_URL
if (!configuredUrl) throw new Error("POSTGRES_URL belum diatur.")
const parsedUrl = new URL(configuredUrl)
parsedUrl.searchParams.delete("schema")
const connectionString = parsedUrl.toString()
const permissionsOnly = Bun.argv.includes("--permissions")
const checks = permissionsOnly ? ["verify-permissions.sql"] : ["verify-permissions.sql", "verify.sql"]
for (const file of checks) {
  const child = Bun.spawn(["psql", connectionString, "-X", "-v", "ON_ERROR_STOP=1", "-f", `${import.meta.dir}/../${file}`], {
    stdout: "inherit",
    stderr: "inherit",
  })
  const code = await child.exited
  if (code !== 0) throw new Error(`Verifikasi database gagal pada ${file}, kode ${code}`)
}
console.log(permissionsOnly ? "Data API grants and RLS policies verified." : "Data API permissions and sample publication state verified.")
