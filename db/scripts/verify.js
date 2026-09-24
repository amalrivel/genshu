const configuredUrl = process.env.POSTGRES_URL
if (!configuredUrl) throw new Error("POSTGRES_URL belum diatur.")
const parsedUrl = new URL(configuredUrl)
parsedUrl.searchParams.delete("schema")
const connectionString = parsedUrl.toString()
const child = Bun.spawn(["psql", connectionString, "-X", "-v", "ON_ERROR_STOP=1", "-f", `${import.meta.dir}/../verify.sql`], {
  stdout: "inherit",
  stderr: "inherit",
})
const code = await child.exited
if (code !== 0) throw new Error(`Verifikasi database gagal dengan kode ${code}`)
console.log("Sample publication state and anonymous database permissions verified.")
