create or replace function public.save_practice_set(p_set jsonb, p_questions jsonb, p_update boolean)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  practice_id text := p_set->>'id';
  v_is_published boolean := coalesce((p_set->>'is_published')::boolean, false);
  v_max_questions integer := 30;
  v_stored_source_repository text;
  v_group_id text;
  v_child_count integer;
  v_position_count integer;
  v_unpublished_count integer;
begin
  if not (select private.is_sensei()) then raise exception 'Sensei permission required' using errcode = '42501'; end if;

  if p_update then
    select source_repository into v_stored_source_repository
      from public.practice_sets where id = practice_id for update;
    if v_stored_source_repository = 'amalrivel/gentsuki-ready-web' then v_max_questions := 60; end if;
  elsif p_set->>'source_repository' = 'amalrivel/gentsuki-ready-web'
    and p_set->>'source_commit' = 'f085af618ff11e594868eeed653a945d6daaa682'
    and p_set->>'source_ref' = any(array[
      'book_1','book_2','book_3','genchare_1','genchare_2','genchare_3','genchare_4',
      'menkyo_blog_1','menkyo_blog_2','menkyo_blog_3','menkyo_blog_4','menkyo_blog_5'
    ])
    and practice_id = 'gentsuki-' || replace(replace(p_set->>'source_ref', 'menkyo_blog_', 'menkyo-blog-'), '_', '-') then
    -- The larger create limit is reserved for the pinned importer bank identities.
    v_max_questions := 60;
  end if;

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
        where q.value->>'question_group_id' = v_group_id and q.value->>'group_position' in ('0','1','2');
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
        where q.value->>'question_group_id' = v_group_id and q.value->>'group_position' in ('0','1','2');
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
      updated_at = now()
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

revoke all on function public.save_practice_set(jsonb,jsonb,boolean) from public, anon;
grant execute on function public.save_practice_set(jsonb,jsonb,boolean) to authenticated;
