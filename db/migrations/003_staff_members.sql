create table if not exists staff_members (
  user_id uuid primary key,
  role text not null check (role in ('SENSEI', 'TANTOSHA')),
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table staff_members enable row level security;
revoke all on staff_members from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on staff_members from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on staff_members from authenticated;
  end if;
end;
$$;
