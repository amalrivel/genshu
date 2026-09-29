create or replace function public.repair_gentsuki_illustration_groups(p_set_id text,p_expected jsonb,p_groups jsonb,p_updates jsonb,p_source_digest text)
returns void language plpgsql security invoker set search_path = '' as $$
declare e jsonb; a jsonb; v_count integer := 0;
begin
  if not (select private.is_sensei()) then raise exception 'Sensei permission required' using errcode = '42501'; end if;
  if jsonb_array_length(p_expected) = 0 or jsonb_array_length(p_groups) = 0 or jsonb_array_length(p_expected) <> jsonb_array_length(p_groups)*3 or jsonb_array_length(p_updates) <> jsonb_array_length(p_expected) then raise exception 'Invalid illustration repair payload' using errcode = '22023'; end if;
  if not exists(select 1 from public.practice_sets where id=p_set_id and source_repository='amalrivel/gentsuki-ready-web' and source_commit='f085af618ff11e594868eeed653a945d6daaa682') then raise exception 'Source provenance mismatch' using errcode = '22023'; end if;
  if exists(select 1 from public.practice_question_groups where practice_set_id=p_set_id) then raise exception 'Question groups already exist; refusing repair' using errcode = '23505'; end if;
  for e in select value from jsonb_array_elements(p_expected) loop
    select jsonb_build_object('id',id,'position',position,'question_type',question_type,'prompt',prompt,'prompt_plain',prompt_plain,'translation_id',translation_id,'options',options,'correct_answer_index',correct_answer_index,'explanation_ja',explanation_ja,'explanation_id',explanation_id,'is_published',is_published,'explanation_markup',explanation_markup,'question_context',question_context,'question_context_markup',question_context_markup,'image_url',image_url,'image_width',image_width,'image_height',image_height,'source_ref',source_ref,'source_digest',source_digest)
    into a from public.practice_questions where id=e->>'id' and practice_set_id=p_set_id;
    if a is distinct from e then raise exception 'Imported question changed since original import: %',e->>'source_ref' using errcode='40001'; end if;
    v_count := v_count + 1;
  end loop;
  if v_count <> jsonb_array_length(p_groups)*3 then raise exception 'Incomplete original group question set' using errcode='22023'; end if;
  insert into public.practice_question_groups(id,practice_set_id,position,source_ref,source_digest,question_context,question_context_markup,image_url,image_width,image_height)
  select g.id,p_set_id,g.position,g.source_ref,g.source_digest,g.question_context,g.question_context_markup,g.image_url,g.image_width,g.image_height
  from jsonb_to_recordset(p_groups) as g(id text,position integer,source_ref text,source_digest text,question_context text,question_context_markup text,image_url text,image_width integer,image_height integer);
  update public.practice_questions q set question_group_id=u.question_group_id,group_position=u.group_position,question_context='',question_context_markup='',image_url='',image_width=null,image_height=null,source_digest=u.source_digest
  from jsonb_to_recordset(p_updates) as u(id text,question_group_id text,group_position integer,source_digest text)
  where q.id=u.id and q.practice_set_id=p_set_id;
  if (select count(*) from public.practice_questions where practice_set_id=p_set_id and question_group_id is not null) <> jsonb_array_length(p_updates) then raise exception 'Question group links incomplete' using errcode='22023'; end if;
  update public.practice_sets set source_digest=p_source_digest,updated_at=now() where id=p_set_id;
end; $$;
revoke all on function public.repair_gentsuki_illustration_groups(text,jsonb,jsonb,jsonb,text) from public,anon;
grant execute on function public.repair_gentsuki_illustration_groups(text,jsonb,jsonb,jsonb,text) to authenticated;
