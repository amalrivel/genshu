revoke all on public.practice_question_groups from anon, authenticated;
grant select on public.practice_question_groups to anon, authenticated;
grant insert, update, delete on public.practice_question_groups to authenticated;
create policy "Sensei manages practice question groups" on public.practice_question_groups
  for all to authenticated
  using ((select private.is_sensei()))
  with check ((select private.is_sensei()));
