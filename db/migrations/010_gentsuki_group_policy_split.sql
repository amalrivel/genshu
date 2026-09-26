drop policy "Sensei manages practice question groups" on public.practice_question_groups;
create policy "Sensei inserts practice question groups" on public.practice_question_groups
  for insert to authenticated with check ((select private.is_sensei()));
create policy "Sensei updates practice question groups" on public.practice_question_groups
  for update to authenticated using ((select private.is_sensei())) with check ((select private.is_sensei()));
create policy "Sensei deletes practice question groups" on public.practice_question_groups
  for delete to authenticated using ((select private.is_sensei()));
