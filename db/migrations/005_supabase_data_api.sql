create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter table public.learning_materials enable row level security;
alter table public.practice_sets enable row level security;
alter table public.practice_questions enable row level security;
alter table public.staff_members enable row level security;
alter table public.genshu_schema_migrations enable row level security;

create or replace function private.is_sensei()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members
    where user_id = (select auth.uid()) and is_active and role = 'SENSEI'
  );
$$;

revoke all on function private.is_sensei() from public;
grant execute on function private.is_sensei() to anon, authenticated;

revoke all on public.learning_materials, public.practice_sets, public.practice_questions, public.staff_members from public, anon, authenticated;
grant select on public.learning_materials, public.practice_sets, public.practice_questions to anon, authenticated;
grant insert, update, delete on public.learning_materials, public.practice_sets, public.practice_questions to authenticated;
grant select on public.staff_members to authenticated;
revoke all on public.genshu_schema_migrations from public, anon, authenticated;

create policy "published or staff can read materials" on learning_materials
  for select to anon, authenticated
  using ((is_published and published_at is not null) or (select private.is_sensei()));
create policy "Sensei can insert materials" on learning_materials
  for insert to authenticated with check ((select private.is_sensei()));
create policy "Sensei can update materials" on learning_materials
  for update to authenticated using ((select private.is_sensei())) with check ((select private.is_sensei()));
create policy "Sensei can delete materials" on learning_materials
  for delete to authenticated using ((select private.is_sensei()));

create policy "published or staff can read practice sets" on practice_sets
  for select to anon, authenticated
  using ((is_published and published_at is not null) or (select private.is_sensei()));
create policy "Sensei can insert practice sets" on practice_sets
  for insert to authenticated with check ((select private.is_sensei()));
create policy "Sensei can update practice sets" on practice_sets
  for update to authenticated using ((select private.is_sensei())) with check ((select private.is_sensei()));
create policy "Sensei can delete practice sets" on practice_sets
  for delete to authenticated using ((select private.is_sensei()));

create policy "published practice or staff can read questions" on practice_questions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.practice_sets
      where id = practice_set_id and is_published and published_at is not null
    ) or (select private.is_sensei())
  );
create policy "Sensei can insert questions" on practice_questions
  for insert to authenticated with check ((select private.is_sensei()));
create policy "Sensei can update questions" on practice_questions
  for update to authenticated using ((select private.is_sensei())) with check ((select private.is_sensei()));
create policy "Sensei can delete questions" on practice_questions
  for delete to authenticated using ((select private.is_sensei()));

create policy "staff can read own membership" on staff_members
  for select to authenticated
  using (user_id = (select auth.uid()) and is_active);

create or replace function public.save_practice_set(p_set jsonb, p_questions jsonb, p_update boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  practice_id text := p_set->>'id';
  v_is_published boolean := coalesce((p_set->>'is_published')::boolean, false);
begin
  if not (select private.is_sensei()) then
    raise exception 'Sensei permission required' using errcode = '42501';
  end if;
  if practice_id is null or jsonb_typeof(p_questions) is distinct from 'array' then
    raise exception 'Invalid practice set payload' using errcode = '22023';
  end if;
  if jsonb_array_length(p_questions) not between 1 and 30 then
    raise exception 'Practice set must contain 1 to 30 questions' using errcode = '22023';
  end if;

  if p_update then
    update public.practice_sets set
      title = p_set->>'title', title_id = p_set->>'title_id',
      description = p_set->>'description', description_id = p_set->>'description_id',
      target_level = p_set->>'target_level', topic = p_set->>'topic',
      is_published = v_is_published,
      published_at = case when v_is_published then coalesce(public.practice_sets.published_at, now()) else null end,
      updated_at = now()
    where id = practice_id;
    if not found then raise exception 'Practice set not found' using errcode = 'P0002'; end if;
    delete from public.practice_questions where practice_set_id = practice_id;
  else
    insert into public.practice_sets (id, title, title_id, description, description_id, target_level, topic, is_published, published_at)
    values (practice_id, p_set->>'title', p_set->>'title_id', p_set->>'description', p_set->>'description_id',
      p_set->>'target_level', p_set->>'topic', v_is_published, case when v_is_published then now() else null end);
  end if;

  insert into public.practice_questions
    (id, practice_set_id, position, question_type, prompt, prompt_plain, translation_id, options, correct_answer_index, explanation_ja, explanation_id)
  select practice_id || '-q' || (q.ordinality)::text, practice_id, (q.ordinality - 1)::integer,
    q.question_type, q.prompt, q.prompt_plain, q.translation_id, q.options, q.correct_answer_index,
    q.explanation_ja, q.explanation_id
  from rows from (jsonb_to_recordset(p_questions) as (
    question_type text, prompt text, prompt_plain text, translation_id text,
    options jsonb, correct_answer_index integer, explanation_ja text, explanation_id text
  )) with ordinality as q;
end;
$$;

revoke all on function public.save_practice_set(jsonb, jsonb, boolean) from public, anon;
grant execute on function public.save_practice_set(jsonb, jsonb, boolean) to authenticated;
