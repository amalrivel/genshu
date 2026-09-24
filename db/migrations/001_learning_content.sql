create table if not exists learning_materials (
  slug text primary key,
  title_ja text not null,
  title_id text not null,
  summary_id text not null,
  level text not null check (level in ('N5', 'N4', 'N3')),
  topic text not null,
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  is_published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_published or published_at is not null)
);

create table if not exists practice_sets (
  id text primary key,
  title text not null,
  description text not null default '',
  target_level text not null check (target_level in ('N5', 'N4', 'N3')),
  topic text not null check (topic in ('語彙', '文法', '文化・マナー', '漢字')),
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_published or published_at is not null)
);

create table if not exists practice_questions (
  id text primary key,
  practice_set_id text not null references practice_sets(id) on delete cascade,
  position integer not null check (position >= 0),
  question_type text not null check (question_type in ('MULTIPLE_CHOICE', 'TRUE_FALSE')),
  prompt text not null,
  prompt_plain text not null,
  translation_id text not null default '',
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  correct_answer_index integer not null check (correct_answer_index >= 0),
  explanation_ja text not null,
  explanation_id text not null default '',
  unique (practice_set_id, position),
  check (correct_answer_index < jsonb_array_length(options))
);

create index if not exists learning_materials_published_order_idx
  on learning_materials (sort_order, published_at desc) where is_published;
create index if not exists practice_sets_published_idx
  on practice_sets (published_at desc) where is_published;
create index if not exists practice_questions_set_position_idx
  on practice_questions (practice_set_id, position);

alter table learning_materials enable row level security;
alter table practice_sets enable row level security;
alter table practice_questions enable row level security;
revoke all on learning_materials, practice_sets, practice_questions from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on learning_materials, practice_sets, practice_questions from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on learning_materials, practice_sets, practice_questions from authenticated;
  end if;
end;
$$;
