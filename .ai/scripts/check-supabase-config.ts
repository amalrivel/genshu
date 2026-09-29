import assert from "node:assert/strict"
import { createClient } from "../../src/lib/supabase/server"

const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as const
const original = names.map((name) => process.env[name])
try {
  for (const missing of [names, [names[0]], [names[1]]]) {
    process.env[names[0]] = "https://example.supabase.co"
    process.env[names[1]] = "test-key-that-must-not-appear-in-errors"
    for (const name of missing) delete process.env[name]
    await assert.rejects(createClient(), (error: Error) => {
      assert(error.message.startsWith("Missing Supabase configuration:"))
      for (const name of missing) assert(error.message.includes(name))
      assert(!error.message.includes("test-key-that-must-not-appear-in-errors"))
      assert(!error.message.includes("https://example.supabase.co"))
      return true
    })
  }
  console.log("Missing configuration fails explicitly without exposing values.")
} finally {
  names.forEach((name, index) => {
    if (original[index] === undefined) delete process.env[name]
    else process.env[name] = original[index]
  })
}
