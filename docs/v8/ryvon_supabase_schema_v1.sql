-- ============================================================
-- RYVON DATABASE BLUEPRINT v1
-- Supabase / PostgreSQL
-- Generated for the Personal Product Complete architecture
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
do $$ begin
  create type public.week_status as enum ('active','completed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.day_type as enum ('on','off');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.training_status as enum ('planned','in_progress','completed','partial','missed','rescheduled','rest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.workout_set_type as enum ('warmup','preparatory','recognition','work');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.warmup_type as enum ('warmup','preparatory','recognition');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.weight_condition as enum ('fasted','non_fasted','checkin','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.photo_category as enum (
    'front_relaxed','side_relaxed','back_relaxed',
    'front_pose','side_pose','back_pose','custom'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.note_type as enum (
    'pain','fatigue','illness','travel','different_gym',
    'free_meal','sleep','stress','general'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.note_status as enum ('active','improving','resolved');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- COMMON TRIGGER
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- PROFILE / SETTINGS
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'America/Fortaleza',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,

  weekly_cardio_goal_minutes integer not null default 200 check (weekly_cardio_goal_minutes >= 0),
  sleep_goal_minutes integer not null default 450 check (sleep_goal_minutes between 0 and 1440),
  meal_cutoff_time time not null default '21:30',

  day_on_calories integer not null default 2270 check (day_on_calories >= 0),
  day_on_protein numeric(7,2) not null default 146 check (day_on_protein >= 0),
  day_on_carbs numeric(7,2) not null default 322 check (day_on_carbs >= 0),
  day_on_fat numeric(7,2) not null default 44 check (day_on_fat >= 0),

  day_off_calories integer not null default 2060 check (day_off_calories >= 0),
  day_off_protein numeric(7,2) not null default 142 check (day_off_protein >= 0),
  day_off_carbs numeric(7,2) not null default 279 check (day_off_carbs >= 0),
  day_off_fat numeric(7,2) not null default 43 check (day_off_fat >= 0),

  score_weight_training numeric(5,2) not null default 30 check (score_weight_training >= 0),
  score_weight_nutrition numeric(5,2) not null default 25 check (score_weight_nutrition >= 0),
  score_weight_sleep numeric(5,2) not null default 20 check (score_weight_sleep >= 0),
  score_weight_cardio numeric(5,2) not null default 15 check (score_weight_cardio >= 0),
  score_weight_routine numeric(5,2) not null default 10 check (score_weight_routine >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- WEEKS / DAYS
-- ------------------------------------------------------------
create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_number integer,
  start_date date not null,
  end_date date not null,
  status public.week_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  unique(user_id, start_date)
);

create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid not null references public.weeks(id) on delete cascade,
  date date not null,
  day_type public.day_type not null default 'on',
  training_status public.training_status not null default 'planned',
  activity_level text check (activity_level in ('Baixa','Média','Alta') or activity_level is null),
  energy smallint check (energy between 1 and 5),
  fatigue smallint check (fatigue between 1 and 5),
  hunger smallint check (hunger between 1 and 5),
  stress smallint check (stress between 1 and 5),
  last_meal_time time,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

-- ------------------------------------------------------------
-- DAILY LOGS
-- ------------------------------------------------------------
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid not null unique references public.days(id) on delete cascade,
  sleep_start timestamptz,
  sleep_end timestamptz,
  duration_minutes integer check (duration_minutes >= 0),
  quality smallint check (quality between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sleep_end is null or sleep_start is null or sleep_end >= sleep_start)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid not null unique references public.days(id) on delete cascade,

  calories integer check (calories >= 0),
  protein_g numeric(7,2) check (protein_g >= 0),
  carbs_g numeric(7,2) check (carbs_g >= 0),
  fat_g numeric(7,2) check (fat_g >= 0),

  target_calories integer check (target_calories >= 0),
  target_protein_g numeric(7,2) check (target_protein_g >= 0),
  target_carbs_g numeric(7,2) check (target_carbs_g >= 0),
  target_fat_g numeric(7,2) check (target_fat_g >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid not null references public.days(id) on delete cascade,
  meal_name text,
  meal_time time not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cardio_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid not null references public.days(id) on delete cascade,
  modality text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  rpe smallint check (rpe between 1 and 10),
  timing text,
  notes text,
  started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- EXERCISE LIBRARY / TEMPLATES
-- ------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text,
  primary_muscle text,
  secondary_muscles text[] not null default '{}',
  default_rest_seconds integer not null default 120 check (default_rest_seconds >= 0),
  instructions text,
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sort_order integer not null default 0,
  work_sets integer not null default 2 check (work_sets > 0),
  rep_min integer not null default 5 check (rep_min > 0),
  rep_max integer not null default 9 check (rep_max >= rep_min),
  rest_seconds integer not null default 120 check (rest_seconds >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(template_id, exercise_id)
);

create table if not exists public.warmup_protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_exercise_id uuid not null references public.workout_template_exercises(id) on delete cascade,
  type public.warmup_type not null,
  percentage numeric(5,2) check (percentage >= 0),
  rep_min integer check (rep_min > 0),
  rep_max integer check (rep_max >= rep_min),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Attach planned template to day only after templates exist.
alter table public.days
  add column if not exists training_template_id uuid references public.workout_templates(id) on delete set null;

-- ------------------------------------------------------------
-- EXECUTED WORKOUTS
-- ------------------------------------------------------------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid references public.days(id) on delete set null,
  template_id uuid references public.workout_templates(id) on delete set null,
  started_at timestamptz,
  finished_at timestamptz,
  duration_seconds integer check (duration_seconds >= 0),
  status public.training_status not null default 'in_progress',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finished_at is null or started_at is null or finished_at >= started_at)
);

create table if not exists public.workout_exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_session_id uuid not null references public.workout_exercise_sessions(id) on delete cascade,
  set_number integer not null check (set_number > 0),
  set_type public.workout_set_type not null default 'work',
  weight_kg numeric(8,2) check (weight_kg >= 0),
  reps integer check (reps >= 0),
  rir numeric(4,1) check (rir between 0 and 10),
  completed boolean not null default false,
  volume numeric(12,2) generated always as (
    case
      when weight_kg is not null and reps is not null then weight_kg * reps
      else null
    end
  ) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workout_exercise_session_id, set_number, set_type)
);

-- ------------------------------------------------------------
-- BODY / PROGRESS
-- ------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  condition public.weight_condition not null default 'other',
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date, condition)
);

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  waist_cm numeric(6,2) check (waist_cm > 0),
  abdomen_cm numeric(6,2) check (abdomen_cm > 0),
  chest_cm numeric(6,2) check (chest_cm > 0),
  arm_cm numeric(6,2) check (arm_cm > 0),
  thigh_cm numeric(6,2) check (thigh_cm > 0),
  hip_cm numeric(6,2) check (hip_cm > 0),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(6,2) check (weight_kg > 0),
  category public.photo_category not null default 'custom',
  storage_path text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, storage_path)
);

-- ------------------------------------------------------------
-- CHECK-INS / NOTES
-- ------------------------------------------------------------
create table if not exists public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid not null references public.weeks(id) on delete cascade,
  weight_kg numeric(6,2) check (weight_kg > 0),
  energy smallint check (energy between 1 and 5),
  hunger smallint check (hunger between 1 and 5),
  recovery smallint check (recovery between 1 and 5),
  week_rating smallint check (week_rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  unique(user_id, week_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid references public.days(id) on delete set null,
  week_id uuid references public.weeks(id) on delete set null,
  type public.note_type not null default 'general',
  status public.note_status not null default 'active',
  body_area text,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional persistence for generated insights.
create table if not exists public.generated_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid references public.weeks(id) on delete cascade,
  type text not null,
  severity text,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ------------------------------------------------------------
do $$ declare
  t text;
begin
  foreach t in array array[
    'profiles','user_settings','weeks','days','sleep_logs','nutrition_logs',
    'cardio_sessions','exercises','workout_templates','workout_template_exercises',
    'workout_sessions','workout_sets','notes'
  ]
  loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%I_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t, t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- AUTH BOOTSTRAP
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------
create index if not exists idx_weeks_user_start on public.weeks(user_id, start_date desc);
create index if not exists idx_days_user_date on public.days(user_id, date desc);
create index if not exists idx_days_week_date on public.days(week_id, date);
create index if not exists idx_sleep_day on public.sleep_logs(day_id);
create index if not exists idx_nutrition_day on public.nutrition_logs(day_id);
create index if not exists idx_cardio_user_day on public.cardio_sessions(user_id, day_id);
create index if not exists idx_meals_day_sort on public.meal_time_logs(day_id, sort_order);
create index if not exists idx_templates_user_active on public.workout_templates(user_id, active);
create index if not exists idx_template_exercises_template_sort on public.workout_template_exercises(template_id, sort_order);
create index if not exists idx_sessions_user_started on public.workout_sessions(user_id, started_at desc);
create index if not exists idx_exercise_sessions_workout_sort on public.workout_exercise_sessions(workout_session_id, sort_order);
create index if not exists idx_sets_exercise_session on public.workout_sets(workout_exercise_session_id, set_number);
create index if not exists idx_weight_user_date on public.weight_logs(user_id, date desc);
create index if not exists idx_measurements_user_date on public.body_measurements(user_id, date desc);
create index if not exists idx_photos_user_date on public.progress_photos(user_id, date desc);
create index if not exists idx_notes_user_created on public.notes(user_id, created_at desc);
create index if not exists idx_insights_user_week on public.generated_insights(user_id, week_id, created_at desc);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.weeks enable row level security;
alter table public.days enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.meal_time_logs enable row level security;
alter table public.cardio_sessions enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.warmup_protocols enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercise_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.weight_logs enable row level security;
alter table public.body_measurements enable row level security;
alter table public.progress_photos enable row level security;
alter table public.weekly_checkins enable row level security;
alter table public.notes enable row level security;
alter table public.generated_insights enable row level security;

-- Profiles has id = auth.uid().
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- user_settings has user_id.
drop policy if exists user_settings_all_own on public.user_settings;
create policy user_settings_all_own on public.user_settings
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Generic user_id ownership policies for personal tables.
do $$ declare
  t text;
begin
  foreach t in array array[
    'weeks','days','sleep_logs','nutrition_logs','meal_time_logs','cardio_sessions',
    'exercises','workout_templates','workout_template_exercises','warmup_protocols',
    'workout_sessions','workout_exercise_sessions','workout_sets',
    'weight_logs','body_measurements','progress_photos','weekly_checkins','notes','generated_insights'
  ]
  loop
    execute format('drop policy if exists %I_own_all on public.%I', t, t);
    execute format(
      'create policy %I_own_all on public.%I
       for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t, t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- STORAGE: PRIVATE PROGRESS PHOTOS
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists progress_photos_storage_select on storage.objects;
create policy progress_photos_storage_select
on storage.objects for select
using (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists progress_photos_storage_insert on storage.objects;
create policy progress_photos_storage_insert
on storage.objects for insert
with check (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists progress_photos_storage_update on storage.objects;
create policy progress_photos_storage_update
on storage.objects for update
using (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists progress_photos_storage_delete on storage.objects;
create policy progress_photos_storage_delete
on storage.objects for delete
using (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ------------------------------------------------------------
-- HELPER VIEWS
-- ------------------------------------------------------------
create or replace view public.v_weekly_cardio
with (security_invoker = true)
as
select
  w.id as week_id,
  w.user_id,
  coalesce(sum(c.duration_minutes),0)::integer as total_minutes
from public.weeks w
left join public.days d on d.week_id = w.id
left join public.cardio_sessions c on c.day_id = d.id
group by w.id, w.user_id;

create or replace view public.v_weekly_sleep
with (security_invoker = true)
as
select
  w.id as week_id,
  w.user_id,
  avg(s.duration_minutes)::numeric(10,2) as avg_sleep_minutes,
  min(s.duration_minutes) as min_sleep_minutes,
  max(s.duration_minutes) as max_sleep_minutes
from public.weeks w
left join public.days d on d.week_id = w.id
left join public.sleep_logs s on s.day_id = d.id
group by w.id, w.user_id;

create or replace view public.v_weekly_nutrition
with (security_invoker = true)
as
select
  w.id as week_id,
  w.user_id,
  avg(n.calories)::numeric(10,2) as avg_calories,
  avg(n.protein_g)::numeric(10,2) as avg_protein_g,
  avg(n.carbs_g)::numeric(10,2) as avg_carbs_g,
  avg(n.fat_g)::numeric(10,2) as avg_fat_g
from public.weeks w
left join public.days d on d.week_id = w.id
left join public.nutrition_logs n on n.day_id = d.id
group by w.id, w.user_id;

-- ------------------------------------------------------------
-- SEED FUNCTION FOR A NEW PERSONAL ACCOUNT
-- Call after login:
--   select public.seed_ryvon_personal(auth.uid());
-- ------------------------------------------------------------
create or replace function public.seed_ryvon_personal(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t_pull uuid;
  t_push uuid;
  t_lower_a uuid;
  t_upper uuid;
  t_lower_b uuid;
  e uuid;
  te uuid;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'Cannot seed another user';
  end if;

  insert into public.user_settings (
    user_id,
    weekly_cardio_goal_minutes,
    sleep_goal_minutes,
    meal_cutoff_time,
    day_on_calories, day_on_protein, day_on_carbs, day_on_fat,
    day_off_calories, day_off_protein, day_off_carbs, day_off_fat
  )
  values (
    p_user_id,
    200, 450, '21:30',
    2270, 146, 322, 44,
    2060, 142, 279, 43
  )
  on conflict (user_id) do update set
    weekly_cardio_goal_minutes = excluded.weekly_cardio_goal_minutes,
    sleep_goal_minutes = excluded.sleep_goal_minutes,
    meal_cutoff_time = excluded.meal_cutoff_time,
    day_on_calories = excluded.day_on_calories,
    day_on_protein = excluded.day_on_protein,
    day_on_carbs = excluded.day_on_carbs,
    day_on_fat = excluded.day_on_fat,
    day_off_calories = excluded.day_off_calories,
    day_off_protein = excluded.day_off_protein,
    day_off_carbs = excluded.day_off_carbs,
    day_off_fat = excluded.day_off_fat;

  insert into public.weight_logs(user_id,date,weight_kg,condition)
  values
    (p_user_id,'2026-08-31',69.6,'fasted'),
    (p_user_id,'2026-09-07',69.0,'fasted')
  on conflict do nothing;

  insert into public.workout_templates(user_id,name,sort_order)
  values
    (p_user_id,'Pull',1),
    (p_user_id,'Push',2),
    (p_user_id,'Lower A',3),
    (p_user_id,'Upper',4),
    (p_user_id,'Lower B',5)
  on conflict (user_id,name) do nothing;

  select id into t_pull from public.workout_templates where user_id=p_user_id and name='Pull';
  select id into t_push from public.workout_templates where user_id=p_user_id and name='Push';
  select id into t_lower_a from public.workout_templates where user_id=p_user_id and name='Lower A';
  select id into t_upper from public.workout_templates where user_id=p_user_id and name='Upper';
  select id into t_lower_b from public.workout_templates where user_id=p_user_id and name='Lower B';

  -- Exercise helper is intentionally explicit so seed remains readable and idempotent.

  -- PULL
  insert into public.exercises(user_id,name,primary_muscle,default_rest_seconds,is_custom)
  values (p_user_id,'Puxada Alta Pronada','Costas',120,false)
  on conflict (user_id,name) do nothing;
  select id into e from public.exercises where user_id=p_user_id and name='Puxada Alta Pronada';
  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  values(p_user_id,t_pull,e,1,2,5,9,120) on conflict do nothing;
  select id into te from public.workout_template_exercises where template_id=t_pull and exercise_id=e;
  insert into public.warmup_protocols(user_id,template_exercise_id,type,percentage,rep_min,rep_max,sort_order)
  values
    (p_user_id,te,'warmup',50,12,15,1),
    (p_user_id,te,'preparatory',75,3,5,2),
    (p_user_id,te,'recognition',90,1,2,3)
  on conflict do nothing;

  insert into public.exercises(user_id,name,primary_muscle,default_rest_seconds,is_custom)
  values
    (p_user_id,'T-Bar Row','Costas',120,false),
    (p_user_id,'Remada Baixa Unilateral Neutra','Costas',120,false),
    (p_user_id,'Crucifixo inverso máquina','Deltoide posterior',120,false),
    (p_user_id,'Rosca Scott máquina','Bíceps',120,false),
    (p_user_id,'Abdominal infra banco declinado','Abdômen',120,false),
    (p_user_id,'Supino reto máquina','Peito',120,false),
    (p_user_id,'Crucifixo polia baixa sentado','Peito',120,false),
    (p_user_id,'Desenvolvimento máquina','Ombro',120,false),
    (p_user_id,'Elevação lateral polia média unilateral','Ombro',120,false),
    (p_user_id,'Tríceps Carter','Tríceps',120,false),
    (p_user_id,'Abdominal supra máquina','Abdômen',120,false),
    (p_user_id,'Cadeira flexora','Posterior',120,false),
    (p_user_id,'Cadeira adutora','Adutores',120,false),
    (p_user_id,'Agachamento hack','Quadríceps',120,false),
    (p_user_id,'Elevação pélvica máquina','Glúteos',120,false),
    (p_user_id,'Cadeira extensora','Quadríceps',120,false),
    (p_user_id,'Panturrilha em pé','Panturrilha',120,false),
    (p_user_id,'Supino inclinado máquina','Peito',120,false),
    (p_user_id,'Puxador pela frente unilateral','Costas',120,false),
    (p_user_id,'Voador','Peito',120,false),
    (p_user_id,'Remada articulada pronada','Costas',120,false),
    (p_user_id,'Elevação lateral halter sentado','Ombro',120,false),
    (p_user_id,'Tríceps francês polia','Tríceps',120,false),
    (p_user_id,'Rosca direta costas polia barra W','Bíceps',120,false),
    (p_user_id,'Stiff-Legged Deadlift','Posterior',120,false),
    (p_user_id,'Panturrilha Leg Press 45°','Panturrilha',120,false),
    (p_user_id,'Leg Press 45°','Quadríceps',120,false),
    (p_user_id,'Mesa flexora','Posterior',120,false)
  on conflict (user_id,name) do nothing;

  -- Template ordering / prescriptions.
  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  select p_user_id,t_pull,id,
    case name
      when 'T-Bar Row' then 2
      when 'Remada Baixa Unilateral Neutra' then 3
      when 'Crucifixo inverso máquina' then 4
      when 'Rosca Scott máquina' then 5
      when 'Abdominal infra banco declinado' then 6
    end,2,
    case when name='Crucifixo inverso máquina' then 5 else 5 end,
    case when name='Crucifixo inverso máquina' then 9 else 9 end,120
  from public.exercises
  where user_id=p_user_id and name in (
    'T-Bar Row','Remada Baixa Unilateral Neutra','Crucifixo inverso máquina',
    'Rosca Scott máquina','Abdominal infra banco declinado'
  )
  on conflict do nothing;

  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  select p_user_id,t_push,id,
    case name
      when 'Supino reto máquina' then 1
      when 'Crucifixo polia baixa sentado' then 2
      when 'Desenvolvimento máquina' then 3
      when 'Elevação lateral polia média unilateral' then 4
      when 'Tríceps Carter' then 5
      when 'Abdominal supra máquina' then 6
    end,2,5,
    case when name='Elevação lateral polia média unilateral' then 12 else 9 end,120
  from public.exercises
  where user_id=p_user_id and name in (
    'Supino reto máquina','Crucifixo polia baixa sentado','Desenvolvimento máquina',
    'Elevação lateral polia média unilateral','Tríceps Carter','Abdominal supra máquina'
  )
  on conflict do nothing;

  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  select p_user_id,t_lower_a,id,
    case name
      when 'Cadeira flexora' then 1
      when 'Cadeira adutora' then 2
      when 'Agachamento hack' then 3
      when 'Elevação pélvica máquina' then 4
      when 'Cadeira extensora' then 5
      when 'Panturrilha em pé' then 6
    end,2,5,9,120
  from public.exercises
  where user_id=p_user_id and name in (
    'Cadeira flexora','Cadeira adutora','Agachamento hack',
    'Elevação pélvica máquina','Cadeira extensora','Panturrilha em pé'
  )
  on conflict do nothing;

  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  select p_user_id,t_upper,id,
    case name
      when 'Supino inclinado máquina' then 1
      when 'Puxador pela frente unilateral' then 2
      when 'Voador' then 3
      when 'Remada articulada pronada' then 4
      when 'Elevação lateral halter sentado' then 5
      when 'Tríceps francês polia' then 6
      when 'Rosca direta costas polia barra W' then 7
    end,2,5,
    case when name='Elevação lateral halter sentado' then 12 else 9 end,120
  from public.exercises
  where user_id=p_user_id and name in (
    'Supino inclinado máquina','Puxador pela frente unilateral','Voador',
    'Remada articulada pronada','Elevação lateral halter sentado',
    'Tríceps francês polia','Rosca direta costas polia barra W'
  )
  on conflict do nothing;

  insert into public.workout_template_exercises(user_id,template_id,exercise_id,sort_order,work_sets,rep_min,rep_max,rest_seconds)
  select p_user_id,t_lower_b,id,
    case name
      when 'Stiff-Legged Deadlift' then 1
      when 'Panturrilha Leg Press 45°' then 2
      when 'Leg Press 45°' then 3
      when 'Mesa flexora' then 4
      when 'Cadeira extensora' then 5
      when 'Abdominal supra máquina' then 6
    end,2,5,9,120
  from public.exercises
  where user_id=p_user_id and name in (
    'Stiff-Legged Deadlift','Panturrilha Leg Press 45°','Leg Press 45°',
    'Mesa flexora','Cadeira extensora','Abdominal supra máquina'
  )
  on conflict do nothing;

  -- Add preparatory + recognition to template exercises that do not already have protocols.
  insert into public.warmup_protocols(user_id,template_exercise_id,type,percentage,rep_min,rep_max,sort_order)
  select p_user_id, wte.id, 'preparatory', 75, 3, 5, 2
  from public.workout_template_exercises wte
  where wte.user_id=p_user_id
    and not exists (
      select 1 from public.warmup_protocols wp
      where wp.template_exercise_id=wte.id and wp.type='preparatory'
    );

  insert into public.warmup_protocols(user_id,template_exercise_id,type,percentage,rep_min,rep_max,sort_order)
  select p_user_id, wte.id, 'recognition', 90, 1, 2, 3
  from public.workout_template_exercises wte
  where wte.user_id=p_user_id
    and not exists (
      select 1 from public.warmup_protocols wp
      where wp.template_exercise_id=wte.id and wp.type='recognition'
    );

end;
$$;

revoke all on function public.seed_ryvon_personal(uuid) from public;
grant execute on function public.seed_ryvon_personal(uuid) to authenticated;

commit;
