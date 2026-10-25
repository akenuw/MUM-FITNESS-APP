-- ==========================================================
-- Supabase Schema for My Mum Fitness App
-- Tables: profiles
-- Security: Row Level Security (RLS) enabled
-- ==========================================================

-- 1. Create profiles table linked to Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text not null default 'Friend',
  age integer check (age is null or age >= 13),
  height numeric check (height is null or height >= 0),
  weight numeric check (weight is null or weight >= 0),
  fitness_goals text[] default array[]::text[],
  custom_goal text,
  fitness_level text check (fitness_level is null or fitness_level in ('beginner', 'intermediate', 'advanced')),
  workout_frequency text check (workout_frequency is null or workout_frequency in ('1-2', '3-4', '5+')),
  stats jsonb default '{"workoutsCompleted": 0, "totalMinutes": 0, "averageCaloriesBurned": 0}'::jsonb,
  achievements jsonb default '[]'::jsonb,
  goals jsonb default '{"weekly": {"workouts": 3, "current": 0}}'::jsonb,
  preferences jsonb default '{"dailyReminder": true, "hydrationReminder": true}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Automatically sync new users from auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Friend')
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user on user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Auto update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
