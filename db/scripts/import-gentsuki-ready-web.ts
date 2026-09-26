import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../imports/gentsuki-ready-web")
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8")) as Manifest
const datasetPath = resolve(root, "dataset.json")
const sourceNames = Object.keys(manifest.sourceFiles).sort()
const titles: Record<string, string> = Object.fromEntries(sourceNames.map((name) => {
  const key = name.replace(/\.json$/, "")
  const [, family, number] = key.match(/^(book|genchare|menkyo_blog)_(\d+)$/) ?? []
  const label = family === "book" ? "Book" : family === "genchare" ? "Genchare" : "Menkyo Blog"
  return [key, `${label} ${number}`]
}))
const knownReviewRefs = new Set([
  "book_2/8", "book_3/12", "book_3/28", "genchare_1/7", "genchare_2/16",
  "genchare_2/35", "genchare_3/3", "genchare_3/31", "genchare_3/38",
  "menkyo_blog_2/5", "menkyo_blog_3/39", "menkyo_blog_5/29",
])

type Token = { base: string; reading: string | null }
type SourceChild = {
  sub_number: number; question_plain: string; question_ruby: Token[]; answer: boolean
  explanation_plain: string; explanation_ruby: Token[]
}
type SourceEntry = {
  type: "standard" | "illustration_group"; number: number; answer?: boolean
  question_plain?: string; question_ruby?: Token[]; explanation_plain?: string
  explanation_ruby?: Token[]; image?: string | boolean | null; children?: SourceChild[]
  stem_plain?: string; stem_ruby?: Token[]; focus_points_plain?: string[]; focus_points_ruby?: Token[][]
}
type BankQuestion = {
  id: string; sourceRef: string; sourceDigest: string; position: number
  type: "TRUE_FALSE"; prompt: string; promptPlain: string; context: string
  contextMarkup: string; translationId: string; options: ["○", "×"]
  correctAnswerIndex: 0 | 1; explanationJa: string; explanationMarkup: string
  explanationId: string; imageUrl: string; imageWidth: number | null; imageHeight: number | null
  isPublished: boolean; exception: string | null
}
type Bank = {
  id: string; sourceRef: string; sourceDigest: string; title: string; titleId: string
  targetLevel: "NON_JLPT"; topic: "book" | "genchare" | "menkyo_blog"
  questions: BankQuestion[]; mappings: { sourceRef: string; targetIds: string[]; kind: string }[]
  warnings: string[]
}
type Manifest = {
  repository: string; commit: string; sourceFiles: Record<string, string>
  assetMeta: Record<string, { sha: string; width: number; height: number }>
}

function sha256(value: string | Buffer) { return createHash("sha256").update(value).digest("hex") }
function gitBlobSha(value: Buffer) { return createHash("sha1").update(`blob ${value.length}\0`).update(value).digest("hex") }
function ruby(tokens: Token[] = []) {
  return tokens.map(({ base, reading }) => {
    if (/[{}|]/.test(base) || (reading && /[{}|]/.test(reading))) throw new Error("Furigana contains unsupported token characters")
    return reading ? `{${base}|${reading}}` : base
  }).join("")
}
function normalize(value: string) { return value.normalize("NFKC").replace(/\s+/g, "") }
function sourceImage(value: string | boolean | null | undefined) {
  if (typeof value !== "string") return { imageUrl: "", imageWidth: null, imageHeight: null }
  const key = value.split("/").at(-1)!.replace(/\.[^.]+$/, "")
  const info = manifest.assetMeta[key]
  if (!info || !/^[a-f0-9]{40}$/.test(info.sha)) throw new Error(`Missing image manifest entry: ${key}`)
  return { imageUrl: `/gentsuki-quiz-assets/${info.sha}.jpg`, imageWidth: info.width, imageHeight: info.height }
}

async function convert(): Promise<Bank[]> {
  const banks: Bank[] = []
  for (const filename of sourceNames) {
    const bytes = await readFile(resolve(root, "source", filename))
    if (gitBlobSha(bytes) !== manifest.sourceFiles[filename]) throw new Error(`Source snapshot does not match pinned Git blob: ${filename}`)
    const entries = JSON.parse(bytes.toString("utf8")) as SourceEntry[]
    const key = filename.replace(/\.json$/, "")
    const [, topic, bankNo] = key.match(/^(book|genchare|menkyo_blog)_(\d+)$/) as [string, Bank["topic"], string]
    const bank: Bank = {
      id: `gentsuki-${topic.replace("menkyo_blog", "menkyo-blog")}-${bankNo}`,
      sourceRef: key, sourceDigest: sha256(bytes), title: titles[key], titleId: titles[key],
      targetLevel: "NON_JLPT", topic, questions: [], mappings: [], warnings: [],
    }
    const addQuestion = (entry: SourceEntry | SourceChild, number: number, sub?: number, group?: SourceEntry) => {
      const sourceRef = `${key}/${number}${sub === undefined ? "" : `-${sub}`}`
      const standard = "question_plain" in entry
      const plain = standard ? entry.question_plain! : ""
      const rubyTokens = standard ? entry.question_ruby! : []
      const explanation = standard ? entry.explanation_plain! : ""
      const explanationTokens = standard ? entry.explanation_ruby! : []
      if (!plain.trim() || !explanation.trim() || !rubyTokens?.length || !explanationTokens?.length || typeof entry.answer !== "boolean") {
        throw new Error(`Incomplete source question ${sourceRef}`)
      }
      const contextPlain = group ? [group.stem_plain!, ...(group.focus_points_plain ?? []).map((v) => `• ${v}`)].join("\n") : ""
      const contextMarkup = group
        ? [ruby(group.stem_ruby), ...(group.focus_points_ruby ?? []).map((tokens) => `• ${ruby(tokens)}`)].join("\n")
        : ""
      const image = sourceImage(group?.image ?? (entry as SourceEntry).image)
      const questionRef = sourceRef
      const mismatch = normalize(plain) !== normalize(ruby(rubyTokens).replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1"))
        || normalize(explanation) !== normalize(ruby(explanationTokens).replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1"))
      const knownReview = knownReviewRefs.has(questionRef)
      if (mismatch && !knownReview) throw new Error(`Unexpected plain/ruby text mismatch: ${questionRef}`)
      if (knownReview && !mismatch) throw new Error(`Review exception no longer matches source: ${questionRef}`)
      const content = [plain, ruby(rubyTokens), explanation, ruby(explanationTokens), contextPlain, contextMarkup, image.imageUrl].join("\0")
      const id = `${bank.id}-q-${number}${sub === undefined ? "" : `-${sub}`}`
      bank.questions.push({
        id, sourceRef: questionRef, sourceDigest: sha256(content), position: bank.questions.length,
        type: "TRUE_FALSE", prompt: ruby(rubyTokens), promptPlain: plain,
        context: contextPlain, contextMarkup, translationId: "", options: ["○", "×"],
        correctAnswerIndex: entry.answer ? 0 : 1,
        explanationJa: explanation, explanationMarkup: ruby(explanationTokens), explanationId: "",
        ...image, isPublished: !knownReview,
        exception: knownReview ? "Draf editorial: teks plain dan furigana sumber berbeda; keduanya dipertahankan tanpa koreksi." : null,
      })
      if (typeof group?.image === "boolean" || typeof (entry as SourceEntry).image === "boolean") {
        bank.warnings.push(`${questionRef}: source image marker is boolean; legacy renderer ignores it`)
      }
      return id
    }

    for (const entry of entries) {
      if (entry.type === "standard") {
        const id = addQuestion(entry, entry.number)
        bank.mappings.push({ sourceRef: `${key}/${entry.number}`, targetIds: [id], kind: "one_to_one" })
      } else if (entry.type === "illustration_group" && entry.children?.length) {
        const ids = entry.children.map((child) => addQuestion(child, entry.number, child.sub_number, entry))
        bank.mappings.push({ sourceRef: `${key}/${entry.number}`, targetIds: ids, kind: "expanded_context" })
      } else throw new Error(`Unsupported source entry ${key}/${entry.number}`)
    }
    bank.sourceDigest = sha256(JSON.stringify({
      questions: bank.questions,
      mappings: bank.mappings,
      warnings: bank.warnings,
    }))
    banks.push(bank)
  }
  return banks
}

async function validate(banks: Bank[]) {
  const questions = banks.flatMap((bank) => bank.questions)
  const refs = new Set<string>()
  const texts = new Set<string>()
  for (const q of questions) {
    if (refs.has(q.sourceRef)) throw new Error(`Duplicate source ref ${q.sourceRef}`)
    refs.add(q.sourceRef)
    const text = normalize(q.promptPlain)
    if (texts.has(text)) throw new Error(`Duplicate question text ${q.sourceRef}`)
    texts.add(text)
    if (q.type !== "TRUE_FALSE" || q.options.length !== 2 || q.correctAnswerIndex !== 0 && q.correctAnswerIndex !== 1 || !q.explanationJa || !q.promptPlain) {
      throw new Error(`Invalid converted question ${q.sourceRef}`)
    }
    if (q.imageUrl) {
      const file = resolve(process.cwd(), "public", q.imageUrl.replace(/^\//, ""))
      const asset = await readFile(file)
      if (gitBlobSha(asset) !== q.imageUrl.split("/").at(-1)!.replace(/\.jpg$/, "")) throw new Error(`Image asset mismatch: ${q.imageUrl}`)
    }
  }
  if (banks.length !== 12 || questions.length !== 614 || refs.size !== 614 || banks.reduce((n, b) => n + b.mappings.length, 0) !== 586) throw new Error(`Source count mismatch: ${banks.length} banks, ${questions.length} questions`)
  if (questions.filter((q) => q.isPublished).length !== 602 || questions.filter((q) => !q.isPublished).length !== 12) throw new Error("Review/draft count changed; inspect source diffs")
}

const banks = await convert()
await validate(banks)
const serialized = JSON.stringify({ repository: manifest.repository, sourceCommit: manifest.commit, banks }, null, 2) + "\n"
const mode = process.argv[2] ?? "--check"
if (mode === "--snapshot") await writeFile(datasetPath, serialized)
else {
  const checked = JSON.parse(await readFile(datasetPath, "utf8"))
  if (JSON.stringify(checked, null, 2) + "\n" !== serialized) throw new Error("Converted dataset is stale; run with --snapshot")
}

if (mode === "--snapshot" || mode === "--check") {
  console.log(JSON.stringify({ mode: mode.slice(2), sets: banks.length, questions: banks.reduce((n, b) => n + b.questions.length, 0), published: 602, drafts: 12, assets: Object.keys(manifest.assetMeta).length, warnings: banks.reduce((n, b) => n + b.warnings.length, 0) }))
  process.exit(0)
}

if (mode !== "--dry-run" && mode !== "--apply" && mode !== "--verify-live") throw new Error("Usage: --snapshot | --check | --dry-run | --apply | --verify-live")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const email = process.env.SENSEI_EMAIL
const password = process.env.SENSEI_PASSWORD
if (!url || !key || !email || !password) throw new Error("Set Supabase publishable URL/key and Sensei importer credentials in the local environment")
if (!url.includes("invekuqrmwvrfxkcqfcp")) throw new Error("Refusing to access an unexpected Supabase project")
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const { error: authError } = await client.auth.signInWithPassword({ email, password })
if (authError) throw new Error("Sensei authentication failed")
const { data: userData } = await client.auth.getUser()
if (!userData.user) throw new Error("Sensei session missing after authentication")
const { data: membership, error: memberError } = await client.from("staff_members").select("role,is_active").eq("user_id", userData.user.id).maybeSingle()
if (memberError || membership?.role !== "SENSEI" || !membership.is_active) throw new Error("Authenticated account is not an active Sensei")
const { data: existing, error: lookupError } = await client.from("practice_sets")
  .select("id,title,title_id,description,description_id,target_level,topic,is_published,published_at,source_repository,source_ref,source_commit,source_digest")
  .eq("source_repository", manifest.repository)
if (lookupError) throw new Error(`Existing import lookup failed: ${lookupError.message}`)
const byRef = new Map((existing ?? []).map((row) => [row.source_ref, row]))
const { data: idMatches, error: idError } = await client.from("practice_sets").select("id,source_repository,source_ref,source_commit,source_digest").in("id", banks.map((bank) => bank.id))
if (idError) throw new Error(`Existing ID collision lookup failed: ${idError.message}`)
const byId = new Map((idMatches ?? []).map((row) => [row.id, row]))
if (mode === "--verify-live") {
  const setRows = existing ?? []
  const setByRef = new Map(setRows.map((row) => [row.source_ref, row]))
  const errors: string[] = []
  let storedImageCount = 0
  for (const bank of banks) {
    const set = setByRef.get(bank.sourceRef)
    if (!set || set.id !== bank.id || set.source_commit !== manifest.commit || set.source_digest !== bank.sourceDigest
      || set.title !== bank.title || set.title_id !== bank.titleId || set.description !== "" || set.description_id !== ""
      || set.target_level !== bank.targetLevel || set.topic !== bank.topic || !set.is_published || !set.published_at) {
      errors.push(`set:${bank.sourceRef}`)
      continue
    }
    const { data: questions, error } = await client.from("practice_questions")
      .select("id,practice_set_id,position,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,is_published,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,source_ref,source_digest")
      .eq("practice_set_id", bank.id).order("position")
    if (error || !questions || questions.length !== bank.questions.length) { errors.push(`count:${bank.sourceRef}`); continue }
    storedImageCount += questions.filter((q) => q.image_url).length
    const actual = new Map(questions.map((q) => [q.source_ref, q]))
    for (const q of bank.questions) {
      const row = actual.get(q.sourceRef)
      if (!row || JSON.stringify([
        row.id, row.position, row.question_type, row.prompt, row.prompt_plain, row.translation_id,
        row.options, row.correct_answer_index, row.explanation_ja, row.explanation_id, row.is_published,
        row.explanation_markup, row.question_context, row.question_context_markup, row.image_url,
        row.image_width, row.image_height, row.source_digest,
      ]) !== JSON.stringify([
        q.id, q.position, q.type, q.prompt, q.promptPlain, q.translationId, q.options,
        q.correctAnswerIndex, q.explanationJa, q.explanationId, q.isPublished, q.explanationMarkup,
        q.context, q.contextMarkup, q.imageUrl, q.imageWidth, q.imageHeight, q.sourceDigest,
      ])) errors.push(`question:${q.sourceRef}`)
    }
  }
  const publicClient = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: publicSets, error: publicSetError } = await publicClient.from("practice_sets").select("source_ref")
    .eq("source_repository", manifest.repository).eq("is_published", true).not("published_at", "is", null)
  const { data: publicQuestions, error: publicQuestionError } = await publicClient.from("practice_questions")
    .select("is_published").in("practice_set_id", banks.map((bank) => bank.id))
  const publicQ = publicQuestions ?? []
  const publicDrafts = publicQ.filter((q) => !q.is_published).length
  if (publicSetError || publicQuestionError || publicSets?.length !== 12 || publicQ.length !== 602 || publicDrafts !== 0) errors.push("anonymous-rls")
  const expectedImages = banks.flatMap((bank) => bank.questions).filter((q) => q.imageUrl).length
  const storedImages = storedImageCount
  if (expectedImages !== storedImages) errors.push("image-count")
  console.log(JSON.stringify({ mode: "verify-live", sets: setByRef.size, questions: banks.reduce((n, b) => n + b.questions.length, 0), published: 602, drafts: 12, anonymousSets: publicSets?.length ?? 0, anonymousQuestions: publicQ.length, anonymousDrafts: publicDrafts, mismatches: errors.length }))
  if (errors.length) { console.error(errors.slice(0, 20).join("\n")); process.exitCode = 1 }
  process.exit()
}
const summary = { insert: 0, update: 0, skip: 0, error: 0 }
for (const bank of banks) {
  const prior = byRef.get(bank.sourceRef)
  const idCollision = byId.get(bank.id)
  if (!prior && idCollision) { summary.error++; console.error(`ID collision needs manual review: ${bank.sourceRef}`); continue }
  if (!prior) { summary.insert++; continue }
  if (prior.source_commit === manifest.commit && prior.source_digest === bank.sourceDigest) summary.skip++
  else { summary.error++; console.error(`Collision needs manual review: ${bank.sourceRef}`) }
}
console.log(JSON.stringify({ mode: mode.slice(2), ...summary, questions: banks.reduce((n, b) => n + b.questions.length, 0), writes: mode === "--apply" }))
if (summary.error) process.exitCode = 1
if (mode === "--dry-run" || summary.error) process.exit()
for (const bank of banks) {
  if (byRef.has(bank.sourceRef)) continue
  const { error } = await client.rpc("save_practice_set", {
    p_set: {
      id: bank.id, title: bank.title, title_id: bank.titleId, description: "", description_id: "",
      target_level: bank.targetLevel, topic: bank.topic, is_published: true,
      source_repository: manifest.repository, source_ref: bank.sourceRef, source_commit: manifest.commit,
      source_digest: bank.sourceDigest,
    },
    p_questions: bank.questions.map((q) => ({
      id: q.id, question_type: q.type, prompt: q.prompt, prompt_plain: q.promptPlain,
      translation_id: q.translationId, options: q.options, correct_answer_index: q.correctAnswerIndex,
      explanation_ja: q.explanationJa, explanation_id: q.explanationId, is_published: q.isPublished,
      explanation_markup: q.explanationMarkup, question_context: q.context,
      question_context_markup: q.contextMarkup, image_url: q.imageUrl, image_width: q.imageWidth,
      image_height: q.imageHeight, source_ref: q.sourceRef, source_digest: q.sourceDigest,
    })),
    p_update: false,
  })
  if (error) throw new Error(`Atomic insert failed for ${bank.sourceRef}: ${error.message}`)
}
