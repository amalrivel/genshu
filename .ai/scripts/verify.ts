type JsonObject = Record<string, unknown>
const BUILD_TIMEOUT_MS = 5 * 60 * 1000
const TERMINATION_GRACE_PERIOD_MS = 5 * 1000

const locales = [
  ["Indonesian", "messages/id.json"],
  ["Japanese", "messages/ja.json"],
] as const

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

async function run(label: string, command: string[], timeoutMs?: number) {
  console.log(`\n${label}`)
  const child = Bun.spawn(command, {
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
    ...(timeoutMs
      ? {
          env: { ...process.env, BUN_FEATURE_FLAG_NO_ORPHANS: "1" },
        }
      : {}),
  })

  let timedOut = false
  let forceKillTimer: ReturnType<typeof setTimeout> | undefined
  const timeout = timeoutMs
    ? setTimeout(() => {
        timedOut = true
        child.kill("SIGTERM")
        forceKillTimer = setTimeout(() => child.kill("SIGKILL"), TERMINATION_GRACE_PERIOD_MS)
      }, timeoutMs)
    : undefined

  const exitCode = await child.exited
  if (timeout) clearTimeout(timeout)
  if (forceKillTimer) clearTimeout(forceKillTimer)
  if (timedOut) throw new Error(`${label} timed out after ${timeoutMs}ms`)
  if (exitCode !== 0) throw new Error(`${label} failed with exit code ${exitCode}`)
}

async function output(command: string[]) {
  const process = Bun.spawn(command, { stdout: "pipe", stderr: "inherit" })
  const text = await new Response(process.stdout).text()
  const exitCode = await process.exited
  if (exitCode !== 0) throw new Error(`${command.join(" ")} failed with exit code ${exitCode}`)
  return text
}

async function readLocale(name: string, path: string) {
  try {
    const locale = JSON.parse(await Bun.file(path).text())
    if (!isObject(locale)) throw new Error("the root value must be an object")
    return locale
  } catch (error) {
    throw new Error(`${name} locale (${path}) is invalid JSON: ${(error as Error).message}`)
  }
}

function keyTypes(value: JsonObject, prefix = "", result = new Map<string, string>()) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    const type = Array.isArray(child) ? "array" : typeof child
    result.set(path, type)
    if (isObject(child)) keyTypes(child, path, result)
  }
  return result
}

async function validateLocales() {
  console.log("\n[3/6] Indonesian/Japanese locale validation")
  const [[idName, idPath], [jaName, jaPath]] = locales
  const [id, ja] = await Promise.all([readLocale(idName, idPath), readLocale(jaName, jaPath)])
  const idKeys = keyTypes(id)
  const jaKeys = keyTypes(ja)
  const missingFromId = [...jaKeys.keys()].filter((key) => !idKeys.has(key)).sort()
  const missingFromJa = [...idKeys.keys()].filter((key) => !jaKeys.has(key)).sort()
  const typeMismatches = [...idKeys].filter(([key, type]) => jaKeys.get(key) !== undefined && jaKeys.get(key) !== type)

  if (missingFromId.length || missingFromJa.length || typeMismatches.length) {
    if (missingFromId.length) console.error(`Missing from id.json:\n${missingFromId.join("\n")}`)
    if (missingFromJa.length) console.error(`Missing from ja.json:\n${missingFromJa.join("\n")}`)
    if (typeMismatches.length) {
      console.error(`Type mismatches:\n${typeMismatches.map(([key, type]) => `${key}: id=${type}, ja=${jaKeys.get(key)}`).join("\n")}`)
    }
    throw new Error("locale keys do not match")
  }

  console.log(`Locale JSON is valid with ${idKeys.size} matching keys.`)
}

async function verify() {
  await run("[1/6] TypeScript typecheck", ["bun", "run", "typecheck"])
  await run("[2/6] ESLint", ["bun", "run", "lint"])
  await validateLocales()
  await run("[4/6] Production build", ["bun", "run", "build"], BUILD_TIMEOUT_MS)

  const graphifyBefore = await output(["git", "diff", "HEAD", "--binary", "--", "graphify-out"])
  await run("[5/6] Graphify update", ["graphify", "update", "."])
  const graphifyAfter = await output(["git", "diff", "HEAD", "--binary", "--", "graphify-out"])
  await run("[6/6] Git diff check", ["git", "diff", "--check"])

  console.log("\nVerification passed.")
  console.log(`Graphify: ${graphifyBefore === graphifyAfter ? "already current (no tracked changes)." : "produced tracked changes."}`)
}

verify().catch((error) => {
  console.error(`\nVerification failed: ${(error as Error).message}`)
  process.exitCode = 1
})
