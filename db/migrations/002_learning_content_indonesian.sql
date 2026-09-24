alter table learning_materials
  add column if not exists summary_ja text not null default '';

alter table practice_sets
  add column if not exists title_id text not null default '',
  add column if not exists description_id text not null default '';

update learning_materials
set summary_ja = title_ja
where summary_ja = '';

update practice_sets
set title_id = title,
    description_id = description
where title_id = '' or description_id = '';
