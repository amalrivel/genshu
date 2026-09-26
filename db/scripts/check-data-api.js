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
const groupSetId = id + '-group'
const groupId = groupSetId + '-g'
const groupSet = { ...set, id: groupSetId, is_published: false }
const group = { id: groupId, position: 0, source_ref: id + '/group', source_digest: 'qa-group', question_context: '共有状況', question_context_markup: '共有状況', image_url: '', image_width: null, image_height: null }
const groupQuestions = Array.from({ length: 3 }, (_, index) => ({
  id: `${groupSetId}-q${index + 1}`, question_type: 'TRUE_FALSE', prompt: `子問題 ${index + 1}`, prompt_plain: `子問題 ${index + 1}`,
  translation_id: '', options: ['○', '×'], correct_answer_index: 0, explanation_ja: '説明', explanation_id: '',
  is_published: true, question_context: '', question_context_markup: '', image_url: '', source_ref: `${id}/group-${index + 1}`,
  source_digest: 'qa-question', question_group_id: groupId, group_position: index,
}))
const repairSetId = id + '-repair'
const repairGroupId = repairSetId + '-g'
const editedRepairSetId = id + '-repair-edited'
const repairQuestions = Array.from({ length: 3 }, (_, index) => ({
  id: `${repairSetId}-q${index + 1}`, question_type: 'TRUE_FALSE', prompt: `Repair ${index + 1}`, prompt_plain: `Repair ${index + 1}`,
  translation_id: '', options: ['○', '×'], correct_answer_index: 0, explanation_ja: '説明', explanation_id: '', is_published: true,
  question_context: 'Situasi lama\n• metadata lama', question_context_markup: 'Situasi lama', image_url: '',
  source_ref: `${id}/repair-${index + 1}`, source_digest: 'legacy',
}))
try {
  await ok(sensei.from('learning_materials').insert(material))
  await ok(sensei.rpc('save_practice_set', { p_set: set, p_questions: [question], p_update: false }))
  await ok(sensei.rpc('save_practice_set', { p_set: { ...groupSet, question_groups: [group] }, p_questions: groupQuestions, p_update: false }))
  assert.deepEqual((await ok(sensei.from('learning_materials').select('sections').eq('slug', id).single())).sections, sections)
  assert.deepEqual((await ok(sensei.from('practice_questions').select('options').eq('practice_set_id', id).single())).options, question.options)
  for (const [role, c] of readers) {
    assert.deepEqual(await ok(c.from('learning_materials').select('slug').eq('slug', id)), [])
    assert.deepEqual(await ok(c.from('practice_sets').select('id').eq('id', id)), [])
    assert.deepEqual(await ok(c.from('practice_questions').select('id').eq('practice_set_id', id)), [])
    assert.deepEqual(await ok(c.from('practice_question_groups').select('id').eq('id', groupId)), [])
    assert.deepEqual(await ok(c.from('practice_questions').select('id').eq('question_group_id', groupId)), [])
    await denied(c.from('learning_materials').insert({ ...material, slug: id + '-denied' }))
    await denied(c.rpc('save_practice_set', { p_set: { ...set, id: id + '-denied' }, p_questions: [question], p_update: false }))
    await denied(c.from('practice_question_groups').insert({ ...group, id: id + '-denied-group', practice_set_id: groupSetId }))
    await denied(c.rpc('repair_gentsuki_illustration_groups', { p_set_id: groupSetId, p_expected: [], p_groups: [], p_updates: [], p_source_digest: 'denied' }))
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
  const rejectedGroupSave = await sensei.rpc('save_practice_set', {
    p_set: { ...groupSet, is_published: true }, p_questions: groupQuestions.slice(0, 2), p_update: true,
  })
  assert(rejectedGroupSave.error, 'Incomplete group replacement should fail')
  const partlyPublished = groupQuestions.map((row, index) => ({ ...row, is_published: index !== 1 }))
  const rejectedPartialPublish = await sensei.rpc('save_practice_set', {
    p_set: { ...groupSet, is_published: true }, p_questions: partlyPublished, p_update: true,
  })
  assert(rejectedPartialPublish.error, 'Partly unpublished group should not become playable')
  await ok(sensei.rpc('save_practice_set', { p_set: { ...groupSet, is_published: true }, p_questions: groupQuestions, p_update: true }))
  for (const [role, c] of readers) {
    assert.equal((await ok(c.from('learning_materials').select('title_id,sections').eq('slug', id).single())).title_id, 'QA edited')
    assert.equal((await ok(c.from('practice_sets').select('title_id').eq('id', id).single())).title_id, 'QA edited')
    assert.deepEqual((await ok(c.from('practice_questions').select('options').eq('practice_set_id', id).single())).options, question.options)
    assert.deepEqual((await ok(c.from('practice_question_groups').select('id,question_context').eq('id', groupId))).map((row) => ({ id: row.id, question_context: row.question_context })), [{ id: groupId, question_context: group.question_context }])
    assert.equal((await ok(c.from('practice_questions').select('id').eq('question_group_id', groupId))).length, 3)
    const groupUpdate = await c.from('practice_question_groups').update({ question_context: 'Unauthorized' }).eq('id', groupId).select('id')
    assert(groupUpdate.error || groupUpdate.data.length === 0, role + ' must not update group data')
    const groupDelete = await c.from('practice_question_groups').delete().eq('id', groupId).select('id')
    assert(groupDelete.error || groupDelete.data.length === 0, role + ' must not delete group data')
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

  const repairPractice = {
    ...groupSet, id: repairSetId, is_published: false, source_repository: 'amalrivel/gentsuki-ready-web',
    source_ref: id + '/repair', source_commit: 'f085af618ff11e594868eeed653a945d6daaa682', source_digest: 'legacy-set',
  }
  await ok(sensei.rpc('save_practice_set', { p_set: repairPractice, p_questions: repairQuestions, p_update: false }))
  const expected = await ok(sensei.from('practice_questions')
    .select('id,position,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,is_published,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,source_ref,source_digest')
    .eq('practice_set_id', repairSetId).order('position'))
  const repairGroups = [{ ...group, id: repairGroupId, source_ref: repairPractice.source_ref + '/1', source_digest: 'group-digest', question_context: 'Shared situation', question_context_markup: 'Shared situation' }]
  const updates = repairQuestions.map((row, index) => ({ id: row.id, question_group_id: repairGroupId, group_position: index, source_digest: 'new-' + index }))
  await ok(sensei.rpc('repair_gentsuki_illustration_groups', {
    p_set_id: repairSetId, p_expected: expected, p_groups: repairGroups, p_updates: updates, p_source_digest: 'new-set-digest',
  }))
  assert.equal((await ok(sensei.from('practice_question_groups').select('id').eq('practice_set_id', repairSetId))).length, 1)
  assert.equal((await ok(sensei.from('practice_questions').select('question_group_id,group_position,question_context').eq('practice_set_id', repairSetId))).filter((row) => row.question_group_id === repairGroupId && row.question_context === '').length, 3)
  const editedRepairPractice = { ...repairPractice, id: editedRepairSetId, source_ref: id + '/repair-edited' }
  const editedRepairQuestions = repairQuestions.map((row, index) => ({ ...row, id: `${editedRepairSetId}-q${index + 1}`, source_ref: `${id}/repair-edited-${index + 1}` }))
  await ok(sensei.rpc('save_practice_set', { p_set: editedRepairPractice, p_questions: editedRepairQuestions, p_update: false }))
  const editedExpected = await ok(sensei.from('practice_questions')
    .select('id,position,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,is_published,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,source_ref,source_digest')
    .eq('practice_set_id', editedRepairSetId).order('position'))
  await ok(sensei.from('practice_questions').update({ prompt: 'Sensei edit after import' }).eq('id', editedRepairQuestions[0].id))
  const refusedRepair = await sensei.rpc('repair_gentsuki_illustration_groups', {
    p_set_id: editedRepairSetId, p_expected: editedExpected,
    p_groups: [{ ...repairGroups[0], id: editedRepairSetId + '-g' }],
    p_updates: editedRepairQuestions.map((row, index) => ({ id: row.id, question_group_id: editedRepairSetId + '-g', group_position: index, source_digest: 'new-' + index })),
    p_source_digest: 'must-not-apply',
  })
  assert(refusedRepair.error, 'Guarded repair must refuse content changed since the legacy snapshot')
  assert.equal((await ok(sensei.from('practice_question_groups').select('id').eq('practice_set_id', editedRepairSetId))).length, 0)
  const preservedEdit = await ok(sensei.from('practice_questions').select('prompt,question_context').eq('practice_set_id', editedRepairSetId).eq('id', editedRepairQuestions[0].id).single())
  assert.equal(preservedEdit.prompt, 'Sensei edit after import')
  assert.equal(preservedEdit.question_context, repairQuestions[0].question_context)
  console.log('Sensei: group save/publish, rejected partial replacement, and guarded repair passed')
} finally {
  await ok(sensei.from('learning_materials').delete().eq('slug', id))
  await ok(sensei.from('practice_sets').delete().eq('id', id))
  await ok(sensei.from('practice_sets').delete().eq('id', groupSetId))
  await ok(sensei.from('practice_sets').delete().eq('id', repairSetId))
  await ok(sensei.from('practice_sets').delete().eq('id', editedRepairSetId))
  assert.deepEqual(await ok(sensei.from('learning_materials').select('slug').eq('slug', id)), [])
  assert.deepEqual(await ok(sensei.from('practice_questions').select('id').eq('practice_set_id', id)), [])
  for (const c of [sensei, ...readers.map(([, c]) => c)]) await c.auth.signOut({ scope: 'local' })
  console.log('QA content cleaned')
}
if (missing.length) {
  console.error('Incomplete role coverage; missing credentials: ' + missing.join(', '))
  process.exitCode = 1
}
