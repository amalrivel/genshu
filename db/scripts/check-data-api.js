import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
assert(url && key, 'Supabase runtime configuration required')
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const ok = async (query) => {
  const { data, error } = await query
  assert.equal(error, null, error?.message)
  return data
}
const denied = async (query) => {
  const { error } = await query
  assert(error, 'Mutation should be denied')
}
const sensei = client()
const readers = [['anon', client()]]
const missing = []
for (const [role, prefix] of [['Sensei', 'SENSEI'], ['Tantosha', 'TANTOSHA'], ['nonstaff', 'NONSTAFF'], ['inactive', 'INACTIVE_STAFF']]) {
  if (!process.env[prefix + '_EMAIL'] || !process.env[prefix + '_PASSWORD']) {
    missing.push(role)
    continue
  }
  const c = role === 'Sensei' ? sensei : client()
  await ok(c.auth.signInWithPassword({ email: process.env[prefix + '_EMAIL'], password: process.env[prefix + '_PASSWORD'] }))
  if (role !== 'Sensei') readers.push([role, c])
  const membership = await ok(c.from('staff_members').select('role,is_active'))
  if (role === 'Sensei') assert.deepEqual(membership, [{ role: 'SENSEI', is_active: true }])
  else if (role === 'Tantosha') assert.deepEqual(membership, [{ role: 'TANTOSHA', is_active: true }])
  else assert.deepEqual(membership, [])
}
assert(!missing.includes('Sensei'), 'Sensei QA credentials required')
const id = 'qa-api-' + Date.now()
const sections = [{ headingJa: '日本語', headingId: 'Indonesia', bodyJa: '{日本|にほん}「引用」', bodyId: 'Baris satu\nBaris dua 😀' }]
const material = { slug: id, title_ja: 'QA', title_id: 'QA', summary_ja: 'QA', summary_id: 'QA', level: 'N5', topic: 'QA', sections, is_published: false }
const set = { id, title: 'QA', title_id: 'QA', description: 'QA', description_id: 'QA', target_level: 'N5', topic: '語彙', is_published: false }
const question = { question_type: 'MULTIPLE_CHOICE', prompt: '{日本|にほん}', prompt_plain: '日本', translation_id: 'Jepang', options: ['日本', 'Indonesia 😀', '「引用」', 'Baris\nbaru'], correct_answer_index: 0, explanation_ja: '説明', explanation_id: 'Penjelasan' }
try {
  await ok(sensei.from('learning_materials').insert(material))
  await ok(sensei.rpc('save_practice_set', { p_set: set, p_questions: [question], p_update: false }))
  assert.deepEqual((await ok(sensei.from('learning_materials').select('sections').eq('slug', id).single())).sections, sections)
  assert.deepEqual((await ok(sensei.from('practice_questions').select('options').eq('practice_set_id', id).single())).options, question.options)
  for (const [role, c] of readers) {
    assert.deepEqual(await ok(c.from('learning_materials').select('slug').eq('slug', id)), [])
    assert.deepEqual(await ok(c.from('practice_sets').select('id').eq('id', id)), [])
    assert.deepEqual(await ok(c.from('practice_questions').select('id').eq('practice_set_id', id)), [])
    await denied(c.from('learning_materials').insert({ ...material, slug: id + '-denied' }))
    await denied(c.rpc('save_practice_set', { p_set: { ...set, id: id + '-denied' }, p_questions: [question], p_update: false }))
    const { data: user } = await c.auth.getUser()
    const userId = user.user?.id ?? '00000000-0000-0000-0000-000000000001'
    await denied(c.from('staff_members').insert({ user_id: userId, role: 'SENSEI', display_name: 'QA', is_active: true }))
    await denied(c.from('staff_members').update({ role: 'SENSEI', is_active: true }).eq('user_id', userId))
    console.log(role + ': drafts and child rows hidden; writes and self-escalation denied')
  }
  await denied(sensei.from('staff_members').update({ role: 'TANTOSHA' }).eq('user_id', (await sensei.auth.getUser()).data.user.id))
  await denied(sensei.rpc('save_practice_set', { p_set: { ...set, title: 'Should rollback' }, p_questions: [{ ...question, options: ['invalid'] }], p_update: true }))
  assert.equal((await ok(sensei.from('practice_sets').select('title').eq('id', id).single())).title, 'QA')
  assert.deepEqual((await ok(sensei.from('practice_questions').select('options').eq('practice_set_id', id).single())).options, question.options)
  await ok(sensei.from('learning_materials').update({ title_id: 'QA edited', is_published: true, published_at: new Date().toISOString() }).eq('slug', id))
  await ok(sensei.rpc('save_practice_set', { p_set: { ...set, title_id: 'QA edited', is_published: true }, p_questions: [question], p_update: true }))
  for (const [role, c] of readers) {
    assert.equal((await ok(c.from('learning_materials').select('title_id,sections').eq('slug', id).single())).title_id, 'QA edited')
    assert.equal((await ok(c.from('practice_sets').select('title_id').eq('id', id).single())).title_id, 'QA edited')
    assert.deepEqual((await ok(c.from('practice_questions').select('options').eq('practice_set_id', id).single())).options, question.options)
    console.log(role + ': published content and child JSON readable')
    for (const query of [
      c.from('learning_materials').update({ title_id: 'Unauthorized' }).eq('slug', id).select('slug'),
      c.from('practice_sets').delete().eq('id', id).select('id'),
      c.from('practice_questions').update({ prompt: 'Unauthorized' }).eq('practice_set_id', id).select('id'),
    ]) {
      const { data, error } = await query
      assert(error || data.length === 0, 'Unauthorized update/delete affected a row')
    }
  }
  assert.equal((await ok(sensei.from('learning_materials').select('title_id').eq('slug', id).single())).title_id, 'QA edited')
  assert.equal((await ok(sensei.from('practice_questions').select('prompt').eq('practice_set_id', id).single())).prompt, question.prompt)
  console.log('Sensei: create/edit/publish, JSON round trip, and RPC rollback passed')
} finally {
  await ok(sensei.from('learning_materials').delete().eq('slug', id))
  await ok(sensei.from('practice_sets').delete().eq('id', id))
  assert.deepEqual(await ok(sensei.from('learning_materials').select('slug').eq('slug', id)), [])
  assert.deepEqual(await ok(sensei.from('practice_questions').select('id').eq('practice_set_id', id)), [])
  for (const c of [sensei, ...readers.map(([, c]) => c)]) await c.auth.signOut({ scope: 'local' })
  console.log('QA content cleaned')
}
if (missing.length) {
  console.error('Incomplete role coverage; missing credentials: ' + missing.join(', '))
  process.exitCode = 1
}
