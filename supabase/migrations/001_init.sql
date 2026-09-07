create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Lucas',
  created_at timestamptz not null default now()
);

create table if not exists public.fitness_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  weekly_cardio_goal integer not null default 200,
  cardio_rpe_goal numeric(4,1) not null default 8,
  sleep_goal_minutes integer not null default 450,
  meal_cutoff_time time not null default '21:30',
  on_calories integer not null default 2270,
  on_protein integer not null default 146,
  on_carbs integer not null default 322,
  on_fat integer not null default 44,
  off_calories integer not null default 2060,
  off_protein integer not null default 142,
  off_carbs integer not null default 279,
  off_fat integer not null default 43,
  cycle_start_date date not null default '2026-09-07',
  program_start_date date not null default '2026-08-30',
  meal_plan jsonb not null default '{}'::jsonb,
  adherence_weights jsonb not null default '{"training":30,"nutrition":25,"sleep":20,"cardio":15,"routine":10}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_number integer not null,
  start_date date not null,
  end_date date not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed')),
  unique (user_id, week_number)
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  day_type text not null default 'off' check (day_type in ('on', 'off')),
  sleep_start time,
  sleep_end time,
  sleep_minutes integer check (sleep_minutes is null or sleep_minutes > 0),
  sleep_quality integer check (sleep_quality is null or sleep_quality between 1 and 5),
  activity_level text check (activity_level is null or activity_level in ('low', 'medium', 'high')),
  calories numeric(8,1) check (calories is null or calories >= 0),
  protein numeric(8,1) check (protein is null or protein >= 0),
  carbs numeric(8,1) check (carbs is null or carbs >= 0),
  fat numeric(8,1) check (fat is null or fat >= 0),
  last_meal_at time,
  meal_cutoff_hit boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.meal_times (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  time time not null,
  position integer not null default 0
);

create table if not exists public.cardio_sessions (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  minutes integer not null check (minutes > 0),
  rpe numeric(4,1) check (rpe is null or (rpe >= 1 and rpe <= 10)),
  timing text not null default 'other' check (timing in ('before_workout', 'after_workout', 'other')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null,
  order_index integer not null,
  is_rest boolean not null default false,
  unique (user_id, slug),
  unique (user_id, order_index)
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  muscle_group text not null default 'Geral',
  unique (user_id, name)
);

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  position integer not null,
  work_sets integer not null default 2,
  rep_min integer not null default 5,
  rep_max integer not null default 9,
  rest_seconds integer not null default 120,
  instructions text
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  daily_log_id uuid references public.daily_logs(id) on delete set null,
  date date not null,
  status text not null default 'planned' check (
    status in ('planned', 'in_progress', 'completed', 'missed', 'rescheduled', 'extra_rest')
  ),
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds integer,
  label text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  position integer not null default 0
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_session_id uuid not null references public.exercise_sessions(id) on delete cascade,
  set_number integer not null,
  weight numeric(8,2) check (weight is null or weight >= 0),
  reps integer check (reps is null or reps >= 0),
  rir numeric(4,1) check (rir is null or (rir >= 0 and rir <= 10)),
  set_type text not null default 'work' check (set_type in ('warmup', 'prep', 'recognition', 'work'))
);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight numeric(6,2) not null check (weight > 0),
  fasted boolean not null default true,
  notes text,
  unique (user_id, date)
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight numeric(6,2),
  category text not null,
  storage_path text not null
);

create table if not exists public.health_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  type text not null,
  status text not null default 'active' check (status in ('active', 'improving', 'resolved')),
  note text not null
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null unique references public.weeks(id) on delete cascade,
  generated_at timestamptz not null default now(),
  training_score numeric(4,1) not null default 0,
  nutrition_score numeric(4,1) not null default 0,
  cardio_score numeric(4,1) not null default 0,
  sleep_score numeric(4,1) not null default 0,
  routine_score numeric(4,1) not null default 0,
  general_score numeric(4,1) not null default 0,
  verdict text not null default 'regular',
  summary jsonb not null default '{}'::jsonb
);

create index if not exists weeks_user_start_idx on public.weeks (user_id, start_date desc);
create index if not exists daily_logs_user_date_idx on public.daily_logs (user_id, date desc);
create index if not exists cardio_sessions_user_idx on public.cardio_sessions (user_id, created_at desc);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions (user_id, date desc);
create index if not exists weight_logs_user_date_idx on public.weight_logs (user_id, date desc);
create index if not exists progress_photos_user_date_idx on public.progress_photos (user_id, date desc);
create index if not exists health_notes_user_date_idx on public.health_notes (user_id, date desc);
create index if not exists exercise_sessions_workout_idx on public.exercise_sessions (workout_session_id);
create index if not exists exercise_sets_session_idx on public.exercise_sets (exercise_session_id);

drop trigger if exists fitness_settings_updated_at on public.fitness_settings;
create trigger fitness_settings_updated_at
before update on public.fitness_settings
for each row execute function public.set_updated_at();

drop trigger if exists daily_logs_updated_at on public.daily_logs;
create trigger daily_logs_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Lucas'))
  on conflict (id) do nothing;

  insert into public.fitness_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.fitness_settings enable row level security;
alter table public.weeks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.meal_times enable row level security;
alter table public.cardio_sessions enable row level security;
alter table public.workout_templates enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.weight_logs enable row level security;
alter table public.progress_photos enable row level security;
alter table public.health_notes enable row level security;
alter table public.weekly_reports enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "settings_own" on public.fitness_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weeks_own" on public.weeks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_logs_own" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cardio_own" on public.cardio_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "templates_own" on public.workout_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises_own" on public.exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_own" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weights_own" on public.weight_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photos_own" on public.progress_photos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_own" on public.health_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "meal_times_own" on public.meal_times for all
using (exists (select 1 from public.daily_logs d where d.id = meal_times.daily_log_id and d.user_id = auth.uid()))
with check (exists (select 1 from public.daily_logs d where d.id = meal_times.daily_log_id and d.user_id = auth.uid()));

create policy "template_exercises_own" on public.workout_template_exercises for all
using (exists (select 1 from public.workout_templates t where t.id = workout_template_exercises.template_id and t.user_id = auth.uid()))
with check (exists (select 1 from public.workout_templates t where t.id = workout_template_exercises.template_id and t.user_id = auth.uid()));

create policy "exercise_sessions_own" on public.exercise_sessions for all
using (exists (select 1 from public.workout_sessions s where s.id = exercise_sessions.workout_session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.workout_sessions s where s.id = exercise_sessions.workout_session_id and s.user_id = auth.uid()));

create policy "exercise_sets_own" on public.exercise_sets for all
using (
  exists (
    select 1
    from public.exercise_sessions es
    join public.workout_sessions s on s.id = es.workout_session_id
    where es.id = exercise_sets.exercise_session_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.exercise_sessions es
    join public.workout_sessions s on s.id = es.workout_session_id
    where es.id = exercise_sets.exercise_session_id and s.user_id = auth.uid()
  )
);

create policy "weekly_reports_own" on public.weekly_reports for all
using (exists (select 1 from public.weeks w where w.id = weekly_reports.week_id and w.user_id = auth.uid()))
with check (exists (select 1 from public.weeks w where w.id = weekly_reports.week_id and w.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "photo_select_own" on storage.objects;
drop policy if exists "photo_insert_own" on storage.objects;
drop policy if exists "photo_update_own" on storage.objects;
drop policy if exists "photo_delete_own" on storage.objects;

create policy "photo_select_own" on storage.objects
for select using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photo_insert_own" on storage.objects
for insert with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photo_update_own" on storage.objects
for update using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "photo_delete_own" on storage.objects
for delete using (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
