do $$
declare
  table_name text;
  role_name text;
  privilege_name text;
begin
  foreach table_name in array array['genshu_schema_migrations', 'learning_materials', 'practice_sets', 'practice_questions', 'staff_members'] loop
    if to_regclass('public.' || table_name) is null then
      raise exception 'Required table public.% is missing', table_name;
    end if;

    if not (select relrowsecurity from pg_class where oid = to_regclass('public.' || table_name)) then
      raise exception 'RLS must be enabled on public.%', table_name;
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name
    ) then
      raise exception 'No direct RLS policies are expected for public.%', table_name;
    end if;

    foreach role_name in array array['anon', 'authenticated'] loop
      if exists (select 1 from pg_roles where rolname = role_name) then
        foreach privilege_name in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] loop
          if has_table_privilege(role_name, 'public.' || table_name, privilege_name) then
            raise exception 'Role % has unexpected % privilege on public.%', role_name, privilege_name, table_name;
          end if;
        end loop;
      end if;
    end loop;
  end loop;
end;
$$;
