create table public.quest_ai_reviews (
  attempt_id bigint primary key references public.quest_attempts(id) on delete cascade,
  student_id uuid not null references public.quest_students(id) on delete cascade,
  class_id uuid not null references public.quest_classes(id) on delete cascade,
  requested_at timestamptz not null default now(),
  review jsonb
);

alter table public.quest_ai_reviews enable row level security;
revoke all on table public.quest_ai_reviews from public, anon, authenticated;
grant select, insert, update on table public.quest_ai_reviews to service_role;

create index quest_ai_reviews_student_time on public.quest_ai_reviews(student_id, requested_at);
create index quest_ai_reviews_class_time on public.quest_ai_reviews(class_id, requested_at);

create function public.quest_reserve_ai_review(p_student uuid, p_attempt bigint)
returns jsonb language plpgsql set search_path = ''
as $$
declare
  player_class uuid;
  existing_review jsonb;
begin
  select s.class_id into player_class
    from public.quest_students s
    join public.quest_attempts a on a.student_id = s.id
    where s.id = p_student and a.id = p_attempt and a.is_correct is null;
  if not found then
    return jsonb_build_object('status', 'missing');
  end if;

  perform 1 from public.quest_classes where id = player_class for update;
  select review into existing_review from public.quest_ai_reviews where attempt_id = p_attempt;
  if found then
    return jsonb_build_object('status', 'existing', 'review', existing_review);
  end if;

  if (select count(*) from public.quest_ai_reviews
      where student_id = p_student and requested_at > now() - interval '24 hours') >= 12
     or (select count(*) from public.quest_ai_reviews
      where class_id = player_class and requested_at > now() - interval '24 hours') >= 180 then
    return jsonb_build_object('status', 'limit');
  end if;

  insert into public.quest_ai_reviews(attempt_id, student_id, class_id)
    values (p_attempt, p_student, player_class);
  return jsonb_build_object('status', 'reserved');
end;
$$;

revoke all on function public.quest_reserve_ai_review(uuid,bigint) from public, anon, authenticated;
grant execute on function public.quest_reserve_ai_review(uuid,bigint) to service_role;
