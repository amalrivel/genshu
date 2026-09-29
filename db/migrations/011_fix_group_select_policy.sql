drop policy "published practice or staff can read question groups" on public.practice_question_groups;
create policy "published practice or staff can read question groups" on public.practice_question_groups
  for select to anon, authenticated using (
    (exists (select 1 from public.practice_sets s where s.id = practice_question_groups.practice_set_id and s.is_published and s.published_at is not null)
      and exists (select 1 from public.practice_questions q where q.question_group_id = practice_question_groups.id and q.is_published))
    or (select private.is_sensei())
  );
