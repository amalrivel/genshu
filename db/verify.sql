do $$
begin
  if not exists (select 1 from learning_materials where slug = 'aisatsu-basics' and is_published and published_at is not null) then
    raise exception 'Expected published sample material';
  end if;
  if exists (select 1 from learning_materials where slug = 'draft-hidden-example' and is_published) then
    raise exception 'Draft material unexpectedly published';
  end if;
  if not exists (select 1 from practice_sets where id = 'station-vocabulary-n5' and is_published and published_at is not null) then
    raise exception 'Expected published sample practice set';
  end if;
  if exists (select 1 from practice_sets where id = 'draft-hidden-practice' and is_published) then
    raise exception 'Draft practice unexpectedly published';
  end if;
  if exists (
    select 1 from practice_sets p
    where p.is_published and p.published_at is not null
      and not exists (select 1 from practice_questions q where q.practice_set_id = p.id)
  ) then
    raise exception 'A published practice set has no questions';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.staff_members'::regclass) or
     not (select relrowsecurity from pg_class where oid = 'public.learning_materials'::regclass) or
     not (select relrowsecurity from pg_class where oid = 'public.practice_sets'::regclass) or
     not (select relrowsecurity from pg_class where oid = 'public.practice_questions'::regclass) then
    raise exception 'RLS must be enabled on every public learning content table';
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') and (
    has_table_privilege('anon', 'public.staff_members', 'SELECT') or
    has_table_privilege('anon', 'public.learning_materials', 'SELECT') or
    has_table_privilege('anon', 'public.learning_materials', 'INSERT') or
    has_table_privilege('anon', 'public.learning_materials', 'UPDATE') or
    has_table_privilege('anon', 'public.practice_sets', 'INSERT') or
    has_table_privilege('anon', 'public.practice_questions', 'INSERT')
  ) then
    raise exception 'Supabase anon role must not access or mutate content tables directly';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') and (
    has_table_privilege('authenticated', 'public.staff_members', 'SELECT') or
    has_table_privilege('authenticated', 'public.learning_materials', 'SELECT') or
    has_table_privilege('authenticated', 'public.practice_sets', 'INSERT') or
    has_table_privilege('authenticated', 'public.practice_questions', 'UPDATE')
  ) then
    raise exception 'Supabase authenticated role must not access content tables directly';
  end if;
end;
$$;
