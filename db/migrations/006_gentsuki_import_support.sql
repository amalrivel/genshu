alter table public.practice_sets
  drop constraint practice_sets_target_level_check,
  drop constraint practice_sets_topic_check,
  add constraint practice_sets_target_level_check check (target_level in ('N5', 'N4', 'N3', 'NON_JLPT')),
  add constraint practice_sets_topic_check check (topic in ('語彙', '文法', '文化・マナー', '漢字', 'book', 'genchare', 'menkyo_blog')),
  add column source_repository text,
  add column source_ref text,
  add column source_commit text,
  add column source_digest text;

create unique index practice_sets_source_ref_uidx
  on public.practice_sets (source_repository, source_ref)
  where source_repository is not null and source_ref is not null;

alter table public.practice_questions
  add column is_published boolean not null default true,
  add column explanation_markup text not null default '',
  add column question_context text not null default '',
  add column question_context_markup text not null default '',
  add column image_url text not null default '',
  add column image_width integer,
  add column image_height integer,
  add column source_ref text,
  add column source_digest text;

alter table public.practice_questions
  add constraint practice_questions_image_metadata_check check (
    (image_url = '' and image_width is null and image_height is null)
    or (image_url ~ '^/gentsuki-quiz-assets/[0-9a-f]{40}[.]jpg$'
        and image_width between 1 and 4096 and image_height between 1 and 4096)
  );

create unique index practice_questions_source_ref_uidx
  on public.practice_questions (source_ref)
  where source_ref is not null;

drop policy "published practice or staff can read questions" on public.practice_questions;
create policy "published practice or staff can read questions" on public.practice_questions
  for select to anon, authenticated
  using (
    (is_published and exists (
      select 1 from public.practice_sets
      where id = practice_set_id and is_published and published_at is not null
    )) or (select private.is_sensei())
  );

create or replace function public.save_practice_set(p_set jsonb, p_questions jsonb, p_update boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practice_id text := p_set->>'id';
  v_is_published boolean := coalesce((p_set->>'is_published')::boolean, false);
  v_max_questions integer := case when p_set->>'source_repository' = 'amalrivel/gentsuki-ready-web' then 60 else 30 end;
begin
  if not (select private.is_sensei()) then
    raise exception 'Sensei permission required' using errcode = '42501';
  end if;
  if practice_id is null or jsonb_typeof(p_questions) is distinct from 'array' then
    raise exception 'Invalid practice set payload' using errcode = '22023';
  end if;
  if jsonb_array_length(p_questions) not between 1 and v_max_questions then
    raise exception 'Practice set question count exceeds its limit' using errcode = '22023';
  end if;

  if p_update then
    update public.practice_sets set
      title = p_set->>'title', title_id = p_set->>'title_id',
      description = p_set->>'description', description_id = p_set->>'description_id',
      target_level = p_set->>'target_level', topic = p_set->>'topic',
      is_published = v_is_published,
      published_at = case when v_is_published then coalesce(public.practice_sets.published_at, now()) else null end,
      source_repository = coalesce(p_set->>'source_repository', public.practice_sets.source_repository),
      source_ref = coalesce(p_set->>'source_ref', public.practice_sets.source_ref),
      source_commit = coalesce(p_set->>'source_commit', public.practice_sets.source_commit),
      source_digest = coalesce(p_set->>'source_digest', public.practice_sets.source_digest),
      updated_at = now()
    where id = practice_id;
    if not found then raise exception 'Practice set not found' using errcode = 'P0002'; end if;
    delete from public.practice_questions where practice_set_id = practice_id;
  else
    insert into public.practice_sets
      (id, title, title_id, description, description_id, target_level, topic, is_published, published_at, source_repository, source_ref, source_commit, source_digest)
    values
      (practice_id, p_set->>'title', p_set->>'title_id', p_set->>'description', p_set->>'description_id',
       p_set->>'target_level', p_set->>'topic', v_is_published, case when v_is_published then now() else null end,
       p_set->>'source_repository', p_set->>'source_ref', p_set->>'source_commit', p_set->>'source_digest');
  end if;

  insert into public.practice_questions
    (id, practice_set_id, position, question_type, prompt, prompt_plain, translation_id, options,
     correct_answer_index, explanation_ja, explanation_id, is_published, explanation_markup,
     question_context, question_context_markup, image_url, image_width, image_height, source_ref, source_digest)
  select coalesce(q.id, practice_id || '-q' || q.ordinality::text), practice_id, (q.ordinality - 1)::integer,
    q.question_type, q.prompt, q.prompt_plain, q.translation_id, q.options, q.correct_answer_index,
    q.explanation_ja, q.explanation_id, coalesce(q.is_published, true),
    coalesce(q.explanation_markup, q.explanation_ja), coalesce(q.question_context, ''), coalesce(q.question_context_markup, ''),
    coalesce(q.image_url, ''), q.image_width, q.image_height, q.source_ref, q.source_digest
  from rows from (jsonb_to_recordset(p_questions) as (
    id text, question_type text, prompt text, prompt_plain text, translation_id text,
    options jsonb, correct_answer_index integer, explanation_ja text, explanation_id text,
    is_published boolean, explanation_markup text, image_url text,
    question_context text, question_context_markup text,
    image_width integer, image_height integer, source_ref text, source_digest text
  )) with ordinality as q;
end;
$$;

revoke all on function public.save_practice_set(jsonb, jsonb, boolean) from public, anon;
grant execute on function public.save_practice_set(jsonb, jsonb, boolean) to authenticated;
