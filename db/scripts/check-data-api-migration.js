// Local SQL behavior check; this does not replace direct Supabase Data API tests.
import assert from "node:assert/strict"
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

const pgBin = process.env.POSTGRES_BIN ?? "/usr/lib/postgresql/16/bin"
const folder = await mkdtemp(join(tmpdir(), "genshu-rls-check-"))
let started = false
const migrations = resolve(import.meta.dir, "../migrations")
const sensei = "11111111-1111-4111-8111-111111111111"
const tantosha = "22222222-2222-4222-8222-222222222222"
const inactive = "33333333-3333-4333-8333-333333333333"
const nonstaff = "44444444-4444-4444-8444-444444444444"
const questions = JSON.stringify([{
  question_type: "TRUE_FALSE", prompt: "漢字", prompt_plain: "漢字", translation_id: "Kanji",
  options: ["○", "×"], correct_answer_index: 0, explanation_ja: "説明", explanation_id: "Penjelasan",
}])
const groupId = "qa-group-g"
const groupRows = (setId, published = [true, true, true], positions = [0, 1, 2], ref = `${setId}/group`, questionGroupId = `${setId}-g`) => JSON.stringify(positions.map((position, index) => ({
  id: `${setId}-q${index + 1}`, question_type: "TRUE_FALSE", prompt: `Group ${index + 1}`,
  prompt_plain: `Group ${index + 1}`, translation_id: "", options: ["○", "×"], correct_answer_index: 0,
  explanation_ja: "説明", explanation_id: "", is_published: published[index], source_ref: `${ref}-${index + 1}`,
  question_group_id: questionGroupId, group_position: position,
})))
const groups = (id) => JSON.stringify([{ id: `${id}-g`, position: 0, source_ref: "qa/group", source_digest: "qa-digest", question_context: "共有状況", question_context_markup: "共有状況", image_url: "", image_width: null, image_height: null }])
const groupedPractice = (id, published = true, includeGroups = true) => JSON.stringify({
  ...JSON.parse(practice(id, published)),
  ...(includeGroups ? { question_groups: JSON.parse(groups(id)) } : {}),
})
const repairSetId = "qa-repair"
const repairSet = JSON.stringify({
  ...JSON.parse(practice(repairSetId, true)), source_repository: "amalrivel/gentsuki-ready-web",
  source_ref: "qa_repair", source_commit: "f085af618ff11e594868eeed653a945d6daaa682", source_digest: "legacy-set",
})
const repairQuestions = JSON.stringify([0, 1, 2].map((index) => ({
  id: `${repairSetId}-q${index + 1}`, question_type: "TRUE_FALSE", prompt: `Repair ${index + 1}`,
  prompt_plain: `Repair ${index + 1}`, translation_id: "", options: ["○", "×"], correct_answer_index: 0,
  explanation_ja: "説明", explanation_id: "", question_context: "Old stem\n• old focus point",
  question_context_markup: "Old stem", image_url: "", source_ref: `qa_repair/1-${index + 1}`, source_digest: "legacy-child",
})))
function practice(id, published, title = "練習") { return JSON.stringify({
  id, title, title_id: "Latihan", description: "説明", description_id: "Penjelasan",
  target_level: "N5", topic: "漢字", is_published: published,
}) }
const asUser = (id) => `reset role; select set_config('request.jwt.claim.sub', '${id}', false); set role authenticated;`
const denied = (sql) => `begin ${sql}; raise exception 'Unauthorized operation succeeded'; exception when insufficient_privilege then null; end;`
const materialInsert = `insert into public.learning_materials(slug,title_ja,title_id,summary_id,level,topic) values ('qa-unauthorized','QA','QA','QA','N5','QA')`
const bootstrap = `
  create role anon;
  create role authenticated;
  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  create table public.genshu_schema_migrations(name text primary key, applied_at timestamptz default now());
`
const fixtures = `
  insert into public.staff_members(user_id,role,display_name,is_active) values
    ('${sensei}','SENSEI','QA Sensei',true),
    ('${tantosha}','TANTOSHA','QA Tantosha',true),
    ('${inactive}','SENSEI','QA Inactive',false);
  insert into public.learning_materials(slug,title_ja,title_id,summary_id,level,topic,sections,is_published,published_at) values
    ('qa-published','漢字','Kanji','QA','N5','QA','[{"bodyJa":"漢字","bodyId":"Kanji"}]',true,now()),
    ('qa-draft','Draft','Draft','QA','N5','QA','[]',false,null);
  ${asUser(sensei)}
  select public.save_practice_set('${practice("qa-published", true)}','${questions}',false);
  select public.save_practice_set('${practice("qa-draft", false)}','${questions}',false);
  select public.save_practice_set('${groupedPractice("qa-group", true)}','${groupRows("qa-group")}',false);
  select public.save_practice_set('${groupedPractice("qa-partial-draft", false)}','${groupRows("qa-partial-draft", [true,false,true])}',false);
  select public.save_practice_set('${repairSet}','${repairQuestions}',false);
  do $$
  declare original_timestamp timestamptz;
  begin
    select published_at into original_timestamp from public.practice_sets where id='qa-published';
    perform public.save_practice_set('${practice("qa-published", true, "更新")}','${questions}',true);
    if (select published_at from public.practice_sets where id='qa-published') <> original_timestamp then
      raise exception 'Editing reset the publication timestamp';
    end if;
    begin
      perform public.save_practice_set('${practice("qa-published", true, "Broken")}',
        '${questions.replace('"correct_answer_index":0', '"correct_answer_index":9')}',true);
      raise exception 'Invalid question was accepted';
    exception when check_violation then null;
    end;
    if (select title from public.practice_sets where id='qa-published') <> '更新' or
       (select options from public.practice_questions where id='qa-published-q1') <> '["○","×"]'::jsonb then
      raise exception 'Practice replacement failed to roll back or JSON changed';
    end if;
    begin
      perform public.save_practice_set('${practice("qa-published", true)}',null,true);
      raise exception 'NULL questions accepted';
    exception when invalid_parameter_value then null;
    end;
    begin
      perform public.save_practice_set('${practice("qa-published", true)}','[]',true);
      raise exception 'Empty questions accepted';
    exception when invalid_parameter_value then null;
    end;
    begin
      perform public.save_practice_set('${groupedPractice("qa-group", true, false)}','${groupRows("qa-group", [true,true], [0,1])}',true);
      raise exception 'Incomplete group replacement accepted';
    exception when invalid_parameter_value then null;
    end;
    begin
      perform public.save_practice_set('${groupedPractice("qa-group", true, false)}','${groupRows("qa-group", [true,false,true])}',true);
      raise exception 'Partly unpublished public group accepted';
    exception when invalid_parameter_value then null;
    end;
    begin
      perform public.save_practice_set('${practice("qa-cross-set", true)}','${groupRows("qa-cross-set")}',false);
      raise exception 'Cross-set group reference accepted';
    exception when invalid_parameter_value then null;
    end;
    if (select count(*) from public.practice_questions where practice_set_id='qa-group' and question_group_id='${groupId}' and group_position in (0,1,2)) <> 3 then
      raise exception 'Rejected group replacement changed existing children';
    end if;
    begin
      insert into public.practice_question_groups(id,practice_set_id,position,source_ref,source_digest,question_context,question_context_markup,image_url)
      values ('qa-invalid-group','qa-group',1,'qa/invalid','qa','bad','bad','');
      set constraints practice_question_group_integrity immediate;
      raise exception 'Invalid direct group insert passed DB integrity validation';
    exception when check_violation then null;
    end;
    set constraints all deferred;
    if (select count(*) from public.practice_questions where practice_set_id='qa-published') <> 1 then
      raise exception 'Invalid payload removed questions';
    end if;
    if (select sections from public.learning_materials where slug='qa-published') <> '[{"bodyJa":"漢字","bodyId":"Kanji"}]'::jsonb then
      raise exception 'Material JSON changed';
    end if;
    ${denied(`update public.staff_members set role='SENSEI' where user_id='${sensei}'`)}
  end;
  $$;
  select public.repair_gentsuki_illustration_groups('${repairSetId}',
    (select jsonb_agg(jsonb_build_object('id',id,'position',position,'question_type',question_type,'prompt',prompt,'prompt_plain',prompt_plain,'translation_id',translation_id,'options',options,'correct_answer_index',correct_answer_index,'explanation_ja',explanation_ja,'explanation_id',explanation_id,'is_published',is_published,'explanation_markup',explanation_markup,'question_context',question_context,'question_context_markup',question_context_markup,'image_url',image_url,'image_width',image_width,'image_height',image_height,'source_ref',source_ref,'source_digest',source_digest) order by position)
      from public.practice_questions where practice_set_id='${repairSetId}'),
    '[{"id":"${repairSetId}-g","position":0,"source_ref":"qa_repair/1","source_digest":"group-digest","question_context":"Shared situation","question_context_markup":"Shared situation","image_url":"/gentsuki-quiz-assets/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg","image_width":10,"image_height":20}]'::jsonb,
    '[{"id":"${repairSetId}-q1","question_group_id":"${repairSetId}-g","group_position":0,"source_digest":"new-child-1"},{"id":"${repairSetId}-q2","question_group_id":"${repairSetId}-g","group_position":1,"source_digest":"new-child-2"},{"id":"${repairSetId}-q3","question_group_id":"${repairSetId}-g","group_position":2,"source_digest":"new-child-3"}]'::jsonb,
    'new-set-digest');
  do $$ begin
    if (select count(*) from public.practice_question_groups where practice_set_id='${repairSetId}') <> 1 or
       (select count(*) from public.practice_questions where practice_set_id='${repairSetId}' and question_group_id='${repairSetId}-g' and group_position in (0,1,2) and question_context='' and image_url='') <> 3 then
      raise exception 'Sensei illustration repair failed to create the shared group';
    end if;
    if exists(select 1 from public.practice_questions where practice_set_id='${repairSetId}' and question_context like '%old focus point%') then
      raise exception 'Repair left legacy focus metadata in a child prompt context';
    end if;
  end $$;
`
const publicChecks = (ownMembership) => `
  do $$ begin
    if not row_security_active('public.learning_materials') then raise exception 'RLS is not active for this role'; end if;
    if exists(select 1 from public.learning_materials where slug='qa-draft') or
       exists(select 1 from public.practice_sets where id='qa-draft') or
       exists(select 1 from public.practice_questions where practice_set_id='qa-draft') or
       exists(select 1 from public.practice_question_groups where id='${groupId}' and practice_set_id='qa-partial-draft') or
       exists(select 1 from public.practice_questions where practice_set_id='qa-partial-draft') then
      raise exception 'Draft or child row leaked';
    end if;
    if (select count(*) from public.learning_materials where slug='qa-published') <> 1 or
       (select count(*) from public.practice_questions where practice_set_id='qa-published') <> 1 then
      raise exception 'Published content inaccessible';
    end if;
    if (select count(*) from public.practice_question_groups where id='${groupId}') <> 1 or
       (select count(*) from public.practice_questions where practice_set_id='qa-group' and question_group_id='${groupId}') <> 3 then
      raise exception 'Complete published group is inaccessible or incomplete';
    end if;
    ${ownMembership === null ? "" : `if (select count(*) from public.staff_members) <> ${ownMembership} then raise exception 'Membership visibility incorrect'; end if;`}
    ${denied(materialInsert)}
    ${denied(`insert into public.staff_members(user_id,role,display_name) values ('${nonstaff}','SENSEI','Escalation')`)}
    ${denied(`update public.staff_members set is_active=true,role='SENSEI' where user_id='${inactive}'`)}
    ${denied(`perform public.save_practice_set('${practice("qa-denied", false)}','${questions}',false)`)}
    ${denied(`insert into public.practice_question_groups(id,practice_set_id,position,source_ref,source_digest,question_context,question_context_markup,image_url) values ('qa-denied-group','qa-group',9,'qa/denied','qa','no','no','')`)}
    ${denied(`perform public.repair_gentsuki_illustration_groups('qa-group','[]','[]','[]','qa')`)}
  end; $$;
`
const checks = `
  reset role; select set_config('request.jwt.claim.sub','',false); set role anon;
  ${publicChecks(null)}
  ${asUser(nonstaff)} ${publicChecks(0)}
  ${asUser(tantosha)} ${publicChecks(1)}
  ${asUser(inactive)} ${publicChecks(0)}
  reset role;
  select 'GENSHU_LOCAL_RLS_CHECK_PASSED';
`

try {
  const init = Bun.spawn([join(pgBin, "initdb"), "-D", folder, "--no-locale", "--encoding=UTF8", "--auth=trust"], {
    stdout: "pipe", stderr: "pipe",
  })
  const [initOut, initErr, initCode] = await Promise.all([
    new Response(init.stdout).text(), new Response(init.stderr).text(), init.exited,
  ])
  assert.equal(initCode, 0, initOut + initErr)
  const files = (await readdir(migrations)).filter((name) => /^\d{3}_.*\.sql$/.test(name)).sort()
  const schema = (await Promise.all(files.map((name) => readFile(join(migrations, name), "utf8")))).join("\n")
  const permissions = await readFile(resolve(import.meta.dir, "../verify-permissions.sql"), "utf8")
  const server = Bun.spawn([join(pgBin, "pg_ctl"), "-D", folder, "-l", join(folder, "server.log"),
    "-o", `-k ${folder} -c listen_addresses='' -p 54329`, "-w", "start"], { stdout: "pipe", stderr: "pipe" })
  const [serverOut, serverErr, serverCode] = await Promise.all([
    new Response(server.stdout).text(), new Response(server.stderr).text(), server.exited,
  ])
  assert.equal(serverCode, 0, serverOut + serverErr + await readFile(join(folder, "server.log"), "utf8"))
  started = true
  const sql = [bootstrap + schema, fixtures + checks, permissions].join("\n")
  const process = Bun.spawn([join(pgBin, "psql"), "-h", folder, "-p", "54329", "-d", "postgres", "-X", "-1", "-v", "ON_ERROR_STOP=1"], {
    stdin: new Blob([sql]), stdout: "pipe", stderr: "pipe",
  })
  const [stdout, stderr, code] = await Promise.all([
    new Response(process.stdout).text(), new Response(process.stderr).text(), process.exited,
  ])
  assert.equal(code, 0, stderr)
  assert.match(stdout, /GENSHU_LOCAL_RLS_CHECK_PASSED/)
  console.log("Local migration, RLS for five roles, JSON round trip, and RPC rollback passed.")
} finally {
  if (started) {
    const stop = Bun.spawn([join(pgBin, "pg_ctl"), "-D", folder, "-m", "immediate", "-w", "stop"], { stdout: "pipe", stderr: "pipe" })
    assert.equal(await stop.exited, 0, "Could not stop the local PostgreSQL test server")
  }
  await rm(folder, { recursive: true, force: true })
}
