alter table public.quest_students add column if not exists quest_profile jsonb not null default '{}'::jsonb;

create or replace function public.quest_record_answer(
  p_student uuid, p_question text, p_topic text, p_skill text, p_response text, p_correct boolean
) returns integer
language plpgsql
set search_path = ''
as $$
declare
  awarded integer := 0;
  latest timestamptz;
begin
  perform 1 from public.quest_students where id = p_student for update;
  select max(created_at) into latest from public.quest_attempts where student_id = p_student;
  if latest > clock_timestamp() - interval '900 milliseconds' then
    return -1;
  end if;
  if p_correct is true then
    insert into public.quest_rewards(student_id, question_id)
    values (p_student, p_question) on conflict do nothing;
    if found then
      awarded := 60;
      update public.quest_students set xp = xp + awarded, coins = coins + 12 where id = p_student;
    end if;
  end if;
  insert into public.quest_attempts(student_id, question_id, topic, skill, response, is_correct, awarded_xp)
  values (p_student, p_question, p_topic, p_skill, p_response, p_correct, awarded);
  return awarded;
end;
$$;
revoke all on function public.quest_record_answer(uuid,text,text,text,text,boolean) from public, anon, authenticated;
grant execute on function public.quest_record_answer(uuid,text,text,text,text,boolean) to service_role;

create or replace function public.quest_save_profile(p_student uuid, p_patch jsonb)
returns jsonb
language sql
set search_path = ''
as $$
  update public.quest_students set quest_profile = quest_profile || p_patch
  where id = p_student returning quest_profile;
$$;
revoke all on function public.quest_save_profile(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.quest_save_profile(uuid,jsonb) to service_role;
