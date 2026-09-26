alter table genshu_schema_migrations enable row level security;
revoke all on genshu_schema_migrations from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on genshu_schema_migrations from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on genshu_schema_migrations from authenticated;
  end if;
end;
$$;
