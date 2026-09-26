do $$
declare
  table_name text;
  privilege_name text;
begin
  foreach table_name in array array['genshu_schema_migrations', 'learning_materials', 'practice_sets', 'practice_questions', 'practice_question_groups', 'staff_members'] loop
    if to_regclass('public.' || table_name) is null then
      raise exception 'Required table public.% is missing', table_name;
    end if;
    if not (select relrowsecurity from pg_class where oid = to_regclass('public.' || table_name)) then
      raise exception 'RLS must be enabled on public.%', table_name;
    end if;
  end loop;

  if not has_table_privilege('anon', 'public.practice_question_groups', 'SELECT') then
    raise exception 'anon needs SELECT on public.practice_question_groups';
  end if;
  foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
    if has_table_privilege('anon', 'public.practice_question_groups', privilege_name) then
      raise exception 'anon must not have % on practice_question_groups', privilege_name;
    end if;
  end loop;
  foreach privilege_name in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
    if not has_table_privilege('authenticated', 'public.practice_question_groups', privilege_name) then
      raise exception 'authenticated needs % on practice_question_groups', privilege_name;
    end if;
  end loop;

  foreach table_name in array array['learning_materials', 'practice_sets', 'practice_questions'] loop
    if not has_table_privilege('anon', 'public.' || table_name, 'SELECT') then
      raise exception 'anon needs SELECT on public.%', table_name;
    end if;
    foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
      if has_table_privilege('anon', 'public.' || table_name, privilege_name) then
        raise exception 'anon must not have % on public.%', privilege_name, table_name;
      end if;
    end loop;
    foreach privilege_name in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
      if not has_table_privilege('authenticated', 'public.' || table_name, privilege_name) then
        raise exception 'authenticated needs % on public.% for RLS-protected access', privilege_name, table_name;
      end if;
    end loop;
    foreach privilege_name in array array['TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
      if has_table_privilege('authenticated', 'public.' || table_name, privilege_name) then
        raise exception 'authenticated must not have % on public.%', privilege_name, table_name;
      end if;
    end loop;
  end loop;

  if not has_table_privilege('authenticated', 'public.staff_members', 'SELECT') then
    raise exception 'authenticated needs SELECT on staff_members for its own active membership';
  end if;
  foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
    if has_table_privilege('anon', 'public.staff_members', privilege_name) or
       has_table_privilege('authenticated', 'public.staff_members', privilege_name) then
      raise exception 'Public roles must not have % on staff_members', privilege_name;
    end if;
  end loop;
  if has_table_privilege('anon', 'public.staff_members', 'SELECT') then
    raise exception 'anon must not read staff_members';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants as grants
    where grants.table_schema = 'public' and grants.table_name = 'genshu_schema_migrations'
      and grants.grantee in ('anon', 'authenticated')
  ) then
    raise exception 'Public roles must not access the migration ledger';
  end if;

  foreach table_name in array array['learning_materials', 'practice_sets', 'practice_questions'] loop
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = table_name and cmd = 'SELECT'
        and qual ilike '%is_published%' and qual ilike '%private.is_sensei%'
    ) then raise exception 'Published/Sensei SELECT policy is missing on public.%', table_name; end if;
    foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE'] loop
      if not exists (
        select 1 from pg_policies where schemaname = 'public' and tablename = table_name and cmd = privilege_name
          and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ilike '%private.is_sensei%'
      ) then raise exception 'Sensei % policy is missing on public.%', privilege_name, table_name; end if;
    end loop;
  end loop;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'staff_members' and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')) then
    raise exception 'Staff membership mutation policies must not exist';
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename in ('learning_materials', 'practice_sets', 'practice_questions')
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) not ilike '%private.is_sensei%'
  ) then
    raise exception 'Every content mutation policy must require an active Sensei';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'staff_members'
      and cmd = 'SELECT' and qual ilike '%auth.uid()%' and qual ilike '%is_active%'
  ) then
    raise exception 'staff_members must be limited to the authenticated user';
  end if;
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'staff_members'
      and cmd = 'SELECT' and (qual not ilike '%auth.uid()%' or qual not ilike '%is_active%')
  ) then raise exception 'Every staff_members SELECT policy must limit access to active own membership'; end if;

  if not has_function_privilege('authenticated', 'public.save_practice_set(jsonb,jsonb,boolean)', 'EXECUTE') or
     has_function_privilege('anon', 'public.save_practice_set(jsonb,jsonb,boolean)', 'EXECUTE') then
    raise exception 'Practice save RPC must be executable only by authenticated users';
  end if;
  if not has_function_privilege('authenticated', 'public.repair_gentsuki_illustration_groups(text,jsonb,jsonb,jsonb,text)', 'EXECUTE') or
     has_function_privilege('anon', 'public.repair_gentsuki_illustration_groups(text,jsonb,jsonb,jsonb,text)', 'EXECUTE') then
    raise exception 'Illustration repair RPC must be executable only by authenticated users';
  end if;
  if not has_function_privilege('anon', 'private.is_playable_practice_group(text,text)', 'EXECUTE') or
     not has_function_privilege('authenticated', 'private.is_playable_practice_group(text,text)', 'EXECUTE') then
    raise exception 'Public group visibility helper must be executable by API roles';
  end if;
  if exists (
    select 1 from pg_proc where oid = 'private.is_playable_practice_group(text,text)'::regprocedure
      and (not prosecdef or array_position(proconfig, 'search_path=""') is null)
  ) then raise exception 'Public group visibility helper must be narrowly scoped SECURITY DEFINER with empty search_path'; end if;
  if exists (
    select 1 from pg_proc
    where oid = 'public.save_practice_set(jsonb,jsonb,boolean)'::regprocedure
      and (prosecdef or array_position(proconfig, 'search_path=""') is null)
  ) then
    raise exception 'Practice save RPC must run as invoker with an empty search_path';
  end if;
  if not has_function_privilege('anon', 'private.is_sensei()', 'EXECUTE') or
     not has_function_privilege('authenticated', 'private.is_sensei()', 'EXECUTE') then
    raise exception 'RLS Sensei helper must be executable by API roles';
  end if;
  if not exists (
    select 1 from pg_proc
    where oid = 'private.is_sensei()'::regprocedure
      and prosecdef and array_position(proconfig, 'search_path=""') is not null
  ) then
    raise exception 'RLS Sensei helper must be security-definer with an empty search_path';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='practice_question_groups' and cmd='SELECT' and qual ilike '%is_playable_practice_group%' and qual ilike '%private.is_sensei%') then
    raise exception 'Group SELECT policy must allow playable groups and Sensei only';
  end if;
  foreach privilege_name in array array['INSERT', 'UPDATE', 'DELETE'] loop
    if not exists (select 1 from pg_policies where schemaname='public' and tablename='practice_question_groups' and cmd=privilege_name and (coalesce(qual,'') || ' ' || coalesce(with_check,'')) ilike '%private.is_sensei%') then
      raise exception 'Sensei % policy is missing on practice_question_groups', privilege_name;
    end if;
  end loop;
  if (select count(*) from pg_trigger where tgrelid in ('public.practice_question_groups'::regclass,'public.practice_questions'::regclass,'public.practice_sets'::regclass) and tgconstraint <> 0 and tgdeferrable) < 3 then
    raise exception 'Deferred group integrity constraints are missing';
  end if;
end;
$$;
