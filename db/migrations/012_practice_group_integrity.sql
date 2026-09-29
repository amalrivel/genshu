create or replace function private.is_playable_practice_group(p_group_id text, p_set_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.practice_question_groups g
    join public.practice_sets s on s.id = g.practice_set_id
    where g.id = p_group_id and g.practice_set_id = p_set_id
      and s.is_published and s.published_at is not null
      and (select count(*) from public.practice_questions q
        where q.question_group_id = g.id and q.practice_set_id = g.practice_set_id
          and q.is_published and q.group_position between 0 and 2) = 3
  );
$$;
revoke all on function private.is_playable_practice_group(text,text) from public;
grant execute on function private.is_playable_practice_group(text,text) to anon, authenticated;

drop policy "published practice or staff can read questions" on public.practice_questions;
create policy "published practice or staff can read questions" on public.practice_questions
  for select to anon, authenticated
  using (
    (is_published and exists (
      select 1 from public.practice_sets s
      where s.id = practice_questions.practice_set_id and s.is_published and s.published_at is not null
    ) and (question_group_id is null or private.is_playable_practice_group(question_group_id, practice_set_id)))
    or (select private.is_sensei())
  );

drop policy "published practice or staff can read question groups" on public.practice_question_groups;
create policy "published practice or staff can read question groups" on public.practice_question_groups
  for select to anon, authenticated
  using (
    private.is_playable_practice_group(id, practice_set_id)
    or (select private.is_sensei())
  );

create or replace function private.check_practice_question_group(p_group_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_set_id text;
  v_set_published boolean;
  v_total integer;
  v_in_set integer;
  v_positions integer;
  v_min_position integer;
  v_max_position integer;
  v_unpublished integer;
begin
  select g.practice_set_id, s.is_published
    into v_set_id, v_set_published
    from public.practice_question_groups g
    join public.practice_sets s on s.id = g.practice_set_id
    where g.id = p_group_id;
  if not found then
    if exists (select 1 from public.practice_questions q where q.question_group_id = p_group_id) then
      raise exception 'Question group % still has children after deletion', p_group_id using errcode = '23514';
    end if;
    return;
  end if;

  select count(*), count(*) filter (where q.practice_set_id = v_set_id),
    count(distinct q.group_position), min(q.group_position), max(q.group_position),
    count(*) filter (where not q.is_published)
    into v_total, v_in_set, v_positions, v_min_position, v_max_position, v_unpublished
    from public.practice_questions q where q.question_group_id = p_group_id;

  if v_total <> 3 or v_in_set <> 3 or v_positions <> 3 or v_min_position <> 0 or v_max_position <> 2 then
    raise exception 'Question group % must have exactly three same-set children at positions 0, 1, 2', p_group_id using errcode = '23514';
  end if;
  if v_set_published and v_unpublished > 0 then
    raise exception 'Published practice sets cannot contain a partly unpublished question group: %', p_group_id using errcode = '23514';
  end if;
end;
$$;

create or replace function private.check_practice_question_group_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_table_name = 'practice_question_groups' then
    perform private.check_practice_question_group(case when tg_op = 'DELETE' then old.id else new.id end);
  else
    if tg_op <> 'INSERT' and old.question_group_id is not null then
      perform private.check_practice_question_group(old.question_group_id);
    end if;
    if tg_op <> 'DELETE' and new.question_group_id is not null
      and (tg_op = 'INSERT' or new.question_group_id is distinct from old.question_group_id
        or new.group_position is distinct from old.group_position
        or new.practice_set_id is distinct from old.practice_set_id
        or new.is_published is distinct from old.is_published) then
      perform private.check_practice_question_group(new.question_group_id);
    end if;
  end if;
  return null;
end;
$$;

create constraint trigger practice_question_group_integrity
  after insert or update or delete on public.practice_question_groups
  deferrable initially deferred for each row execute function private.check_practice_question_group_trigger();
create constraint trigger practice_question_child_integrity
  after insert or update or delete on public.practice_questions
  deferrable initially deferred for each row execute function private.check_practice_question_group_trigger();

create or replace function private.check_published_practice_groups_trigger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare v_group_id text;
begin
  if new.is_published then
    for v_group_id in select id from public.practice_question_groups where practice_set_id = new.id loop
      perform private.check_practice_question_group(v_group_id);
    end loop;
  end if;
  return null;
end;
$$;
create constraint trigger practice_set_group_publication_integrity
  after insert or update of is_published on public.practice_sets
  deferrable initially deferred for each row execute function private.check_published_practice_groups_trigger();

create or replace function public.save_practice_set(p_set jsonb, p_questions jsonb, p_update boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  practice_id text := p_set->>'id';
  v_is_published boolean := coalesce((p_set->>'is_published')::boolean, false);
  v_max_questions integer := case when p_set->>'source_repository' = 'amalrivel/gentsuki-ready-web' then 60 else 30 end;
  v_group_id text;
  v_child_count integer;
  v_position_count integer;
  v_unpublished_count integer;
begin
  if not (select private.is_sensei()) then raise exception 'Sensei permission required' using errcode = '42501'; end if;
  if practice_id is null or jsonb_typeof(p_questions) is distinct from 'array' or jsonb_array_length(p_questions) not between 1 and v_max_questions then
    raise exception 'Invalid practice set payload' using errcode = '22023';
  end if;
  if p_set ? 'question_groups' and jsonb_typeof(p_set->'question_groups') is distinct from 'array' then
    raise exception 'Question groups must be an array' using errcode = '22023';
  end if;

  if p_set ? 'question_groups' then
    for v_group_id in select g.id from jsonb_to_recordset(p_set->'question_groups') as g(id text) loop
      select count(*), count(distinct q.value->>'group_position'), count(*) filter (where coalesce((q.value->>'is_published')::boolean, true) is false)
        into v_child_count, v_position_count, v_unpublished_count
        from jsonb_array_elements(p_questions) q(value)
        where q.value->>'question_group_id' = v_group_id
          and q.value->>'group_position' in ('0','1','2');
      if v_child_count <> 3 or v_position_count <> 3 or (v_is_published and v_unpublished_count > 0) then
        raise exception 'Question group % must contain three ordered eligible children', v_group_id using errcode = '22023';
      end if;
    end loop;
    if (select count(*) from jsonb_to_recordset(p_set->'question_groups') as g(id text)) <>
      (select count(distinct value->>'question_group_id') from jsonb_array_elements(p_questions) where value->>'question_group_id' is not null) then
      raise exception 'Question payload refers to a missing or duplicate group' using errcode = '22023';
    end if;
  else
    for v_group_id in select id from public.practice_question_groups where practice_set_id = practice_id loop
      select count(*), count(distinct q.value->>'group_position'), count(*) filter (where coalesce((q.value->>'is_published')::boolean, true) is false)
        into v_child_count, v_position_count, v_unpublished_count
        from jsonb_array_elements(p_questions) q(value)
        where q.value->>'question_group_id' = v_group_id
          and q.value->>'group_position' in ('0','1','2');
      if v_child_count <> 3 or v_position_count <> 3 or (v_is_published and v_unpublished_count > 0) then
        raise exception 'Question group % must contain three ordered eligible children', v_group_id using errcode = '22023';
      end if;
    end loop;
    if (select count(distinct value->>'question_group_id') from jsonb_array_elements(p_questions) where value->>'question_group_id' is not null) <>
      (select count(*) from public.practice_question_groups where practice_set_id = practice_id) then
      raise exception 'Question payload must preserve every existing group' using errcode = '22023';
    end if;
  end if;

  if exists (select 1 from jsonb_array_elements(p_questions) q(value)
    where (value->>'question_group_id' is null and value->>'group_position' is not null)
       or (value->>'question_group_id' is not null and value->>'group_position' not in ('0','1','2'))) then
    raise exception 'Invalid question group position' using errcode = '22023';
  end if;

  if p_update then
    update public.practice_sets set title = p_set->>'title', title_id = p_set->>'title_id', description = p_set->>'description',
      description_id = p_set->>'description_id', target_level = p_set->>'target_level', topic = p_set->>'topic',
      is_published = v_is_published, published_at = case when v_is_published then coalesce(published_at, now()) else null end,
      source_repository = coalesce(p_set->>'source_repository', source_repository), source_ref = coalesce(p_set->>'source_ref', source_ref),
      source_commit = coalesce(p_set->>'source_commit', source_commit), source_digest = coalesce(p_set->>'source_digest', source_digest), updated_at = now()
    where id = practice_id;
    if not found then raise exception 'Practice set not found' using errcode = 'P0002'; end if;
    delete from public.practice_questions where practice_set_id = practice_id;
  else
    insert into public.practice_sets(id,title,title_id,description,description_id,target_level,topic,is_published,published_at,source_repository,source_ref,source_commit,source_digest)
    values (practice_id,p_set->>'title',p_set->>'title_id',p_set->>'description',p_set->>'description_id',p_set->>'target_level',p_set->>'topic',v_is_published,
      case when v_is_published then now() else null end,p_set->>'source_repository',p_set->>'source_ref',p_set->>'source_commit',p_set->>'source_digest');
  end if;
  if p_set ? 'question_groups' then
    delete from public.practice_question_groups where practice_set_id = practice_id;
    insert into public.practice_question_groups(id,practice_set_id,position,source_ref,source_digest,question_context,question_context_markup,image_url,image_width,image_height)
    select g.id,practice_id,g.position,g.source_ref,g.source_digest,g.question_context,g.question_context_markup,g.image_url,g.image_width,g.image_height
    from jsonb_to_recordset(p_set->'question_groups') as g(id text,position integer,source_ref text,source_digest text,question_context text,question_context_markup text,image_url text,image_width integer,image_height integer);
  end if;
  insert into public.practice_questions(id,practice_set_id,position,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,is_published,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,source_ref,source_digest,question_group_id,group_position)
  select coalesce(q.id,practice_id||'-q'||q.ordinality::text),practice_id,(q.ordinality-1)::integer,q.question_type,q.prompt,q.prompt_plain,q.translation_id,q.options,q.correct_answer_index,q.explanation_ja,q.explanation_id,
    coalesce(q.is_published,true),coalesce(q.explanation_markup,q.explanation_ja),coalesce(q.question_context,''),coalesce(q.question_context_markup,''),coalesce(q.image_url,''),q.image_width,q.image_height,q.source_ref,q.source_digest,q.question_group_id,q.group_position
  from rows from (jsonb_to_recordset(p_questions) as (id text,question_type text,prompt text,prompt_plain text,translation_id text,options jsonb,correct_answer_index integer,explanation_ja text,explanation_id text,is_published boolean,explanation_markup text,image_url text,question_context text,question_context_markup text,image_width integer,image_height integer,source_ref text,source_digest text,question_group_id text,group_position integer)) with ordinality as q;
end; $$;
