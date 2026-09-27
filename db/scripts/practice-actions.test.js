import { afterEach, beforeEach, expect, mock, test } from "bun:test"

let senseiAllowed = true
let storedRepository = "amalrivel/gentsuki-ready-web"
let storedQuestions = []
let rpcCalls = []
let catalogRows = {}
const redirectSignal = new Error("redirect")

mock.module("@/lib/staff", () => ({
  requireSensei: async () => { if (!senseiAllowed) throw new Error("Sensei required") },
}))
mock.module("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table) => ({
      select() { return this },
      eq() { return this },
      not() { return this },
      order() { return this },
      in() { return this },
      maybeSingle: async () => ({ data: { source_repository: storedRepository }, error: null }),
      then(resolve) {
        const data = catalogRows[table] ?? (table === "practice_questions" ? storedQuestions : [])
        return Promise.resolve({ data, error: null }).then(resolve)
      },
    }),
    rpc: async (name, args) => { rpcCalls.push({ name, args }); return { error: null } },
  }),
}))
mock.module("next/cache", () => ({ revalidatePath: () => undefined }))
mock.module("next/navigation", () => ({ redirect: () => { throw redirectSignal } }))
mock.module("next-intl/server", () => ({ getTranslations: async () => (key) => key }))
mock.module("server-only", () => ({}))

const { savePracticeSet } = await import("../../src/app/staff/practice/actions")
const { listPublishedPracticeSets } = await import("../../src/lib/content-repository")

function formFor(id, count, stored = true) {
  const form = new FormData()
  for (const [key, value] of Object.entries({
    id, original: stored ? id : "", titleJa: "練習", titleId: "Latihan", descriptionJa: "", descriptionId: "",
    level: storedRepository ? "NON_JLPT" : "N5", topic: "book", questionCount: String(count), published: "on",
  })) form.set(key, value)
  for (let index = 0; index < count; index++) {
    const qid = stored ? `${id}-q-${index + 1}` : ""
    for (const [name, value] of Object.entries({
      [`id${index}`]: qid,
      [`sourceRef${index}`]: stored ? `book_1/${index + 1}` : "",
      [`sourceDigest${index}`]: stored ? "source-digest" : "",
      [`type${index}`]: "TRUE_FALSE",
      [`prompt${index}`]: `prompt ${index + 1}`,
      [`promptPlain${index}`]: "stale hidden prompt plain",
      [`translationId${index}`]: "",
      [`correct${index}`]: "0",
      [`explanationJa${index}`]: `explanation ${index + 1}`,
      [`explanationMarkup${index}`]: "stale hidden explanation markup",
      [`explanationId${index}`]: "",
      [`context${index}`]: "",
      [`contextMarkup${index}`]: "",
      [`imageUrl${index}`]: "",
      [`imageWidth${index}`]: "",
      [`imageHeight${index}`]: "",
      [`groupId${index}`]: "",
      [`groupPosition${index}`]: "",
      [`isPublished${index}`]: "on",
    })) form.set(name, value)
  }
  return form
}

beforeEach(() => {
  senseiAllowed = true
  storedRepository = "amalrivel/gentsuki-ready-web"
  rpcCalls = []
  catalogRows = {}
  storedQuestions = Array.from({ length: 52 }, (_, index) => ({
    id: `bank-q-${index + 1}`, prompt: `prompt ${index + 1}`, prompt_plain: `teks plain ${index + 1}`,
    explanation_ja: `explanation ${index + 1}`, explanation_markup: `{説明|せつめい}${index + 1}`,
  }))
})
afterEach(() => { mock.clearAllMocks() })

for (const count of [50, 52]) {
  test(`real save action accepts a no-change NON_JLPT import with ${count} questions and preserves source variants`, async () => {
    const result = savePracticeSet(undefined, formFor("bank", count))
    await expect(result).rejects.toBe(redirectSignal)
    expect(rpcCalls).toHaveLength(1)
    const payload = rpcCalls[0].args
    expect(payload.p_set.target_level).toBe("NON_JLPT")
    expect(payload.p_questions).toHaveLength(count)
    expect(payload.p_questions[0].prompt_plain).toBe("teks plain 1")
    expect(payload.p_questions[0].explanation_markup).toBe("{説明|せつめい}1")
    expect(payload.p_set).not.toHaveProperty("source_repository")
    expect(payload.p_update).toBe(true)
  })
}

test("edited prompt and explanation send coherent furigana-on/off values instead of stale hidden values", async () => {
  const form = formFor("bank", 52)
  form.set("prompt0", "{安全|あんぜん}を確認する。")
  form.set("promptPlain0", "古い平文")
  form.set("explanationJa0", "周囲を確認します。")
  form.set("explanationMarkup0", "{古|ふる}い説明")
  const result = savePracticeSet(undefined, form)
  await expect(result).rejects.toBe(redirectSignal)
  const payload = rpcCalls[0].args.p_questions
  expect(payload[0].prompt).toBe("{安全|あんぜん}を確認する。")
  expect(payload[0].prompt_plain).toBe("安全を確認する。")
  expect(payload[0].explanation_ja).toBe("周囲を確認します。")
  expect(payload[0].explanation_markup).toBe("周囲を確認します。")
  expect(payload[1].prompt_plain).toBe("teks plain 2")
  expect(payload[1].explanation_markup).toBe("{説明|せつめい}2")
})

test("ordinary-bank limit and action role gate still prevent RPC calls", async () => {
  storedRepository = null
  storedQuestions = []
  const tooMany = await savePracticeSet(undefined, formFor("ordinary", 31, false))
  expect(tooMany).toHaveProperty("error")
  expect(rpcCalls).toHaveLength(0)

  senseiAllowed = false
  await expect(savePracticeSet(undefined, formFor("ordinary", 1, false))).rejects.toThrow("Sensei required")
  expect(rpcCalls).toHaveLength(0)
})

test("catalog includes group-only banks when Data API children arrive in shuffled order", async () => {
  catalogRows = {
    practice_sets: [{ id: "group-only", title: "Book 3", title_id: "Book 3", description: "", description_id: "", target_level: "NON_JLPT", topic: "book", published_at: "2026-01-01T00:00:00Z" }],
    practice_questions: [2, 0, 1].map((group_position) => ({
      practice_set_id: "group-only", question_group_id: "group-1", group_position, is_published: true,
    })),
    practice_question_groups: [{ id: "group-1", practice_set_id: "group-only" }],
  }
  expect(await listPublishedPracticeSets()).toMatchObject([{ id: "group-only", questionCount: 3 }])
})
