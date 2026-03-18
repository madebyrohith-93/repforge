-- ============================================
-- REPFORGE — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- Project: jmdyxzkbgkshkbmsuqza
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Programs
create table if not exists programs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  total_weeks integer not null default 1,
  source_type text check (source_type in ('pdf', 'image', 'manual')) default 'pdf',
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Days
create table if not exists days (
  id uuid primary key default uuid_generate_v4(),
  program_id uuid not null references programs(id) on delete cascade,
  week_number integer not null,
  day_number integer not null,
  day_label text,
  created_at timestamptz not null default now()
);

-- Exercises
create table if not exists exercises (
  id uuid primary key default uuid_generate_v4(),
  day_id uuid not null references days(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  planned_sets integer,
  planned_reps_per_set integer,
  created_at timestamptz not null default now()
);

-- Sessions (one per user per day logged)
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_id uuid not null references days(id) on delete restrict,
  logged_at timestamptz not null default now(),
  notes text,
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

-- Set logs (core logging record)
create table if not exists set_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  set_number integer not null,
  weight numeric(7,2),
  reps integer,
  unit text check (unit in ('kg', 'lbs')) default 'kg',
  skipped boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists idx_programs_user_id on programs(user_id);
create index if not exists idx_days_program_id on days(program_id);
create index if not exists idx_exercises_day_id on exercises(day_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_sessions_day_id on sessions(day_id);
create index if not exists idx_set_logs_session_id on set_logs(session_id);
create index if not exists idx_set_logs_exercise_id on set_logs(exercise_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table programs enable row level security;
alter table days enable row level security;
alter table exercises enable row level security;
alter table sessions enable row level security;
alter table set_logs enable row level security;

-- Programs: users own their own
create policy "Users manage own programs"
  on programs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Days: accessible if user owns the parent program
create policy "Users access own program days"
  on days for all
  using (
    exists (
      select 1 from programs
      where programs.id = days.program_id
      and programs.user_id = auth.uid()
    )
  );

-- Exercises: accessible if user owns the parent program via days
create policy "Users access own exercises"
  on exercises for all
  using (
    exists (
      select 1 from days
      join programs on programs.id = days.program_id
      where days.id = exercises.day_id
      and programs.user_id = auth.uid()
    )
  );

-- Sessions: users own their own sessions
create policy "Users manage own sessions"
  on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Set logs: accessible if user owns the parent session
create policy "Users manage own set logs"
  on set_logs for all
  using (
    exists (
      select 1 from sessions
      where sessions.id = set_logs.session_id
      and sessions.user_id = auth.uid()
    )
  );
