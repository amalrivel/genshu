const configuredUrl = process.env.POSTGRES_URL
if (!configuredUrl) throw new Error("POSTGRES_URL belum diatur.")
const parsedUrl = new URL(configuredUrl)
if (!["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname)) {
  throw new Error("db:seed hanya untuk PostgreSQL lokal; database jarak jauh tidak boleh ditimpa dengan data contoh.")
}
parsedUrl.searchParams.delete("schema")
const connectionString = parsedUrl.toString()
const child = Bun.spawn(["psql", connectionString, "-X", "-v", "ON_ERROR_STOP=1", "-1", "-f", `${import.meta.dir}/../seed.sql`], {
  stdout: "inherit",
  stderr: "inherit",
})
const code = await child.exited
if (code !== 0) throw new Error(`Seed gagal dengan kode ${code}`)
