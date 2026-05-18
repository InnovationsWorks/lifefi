-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gtdhhqhozlrkkxlhuvrn/sql
--
-- This migration adds stripe_customer_id to profiles and changes the default
-- plan to 'free' so new users start unpaid. Run AFTER 001_create_profiles.sql.

-- Add 'free' to the plan check constraint and stripe_customer_id column
alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'personal', 'bizfi', 'duo'));

alter table public.profiles
  alter column plan set default 'free';

alter table public.profiles
  add column if not exists stripe_customer_id text unique;

-- Update the trigger so new signups start on 'free'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Allow service-role inserts (needed by webhook)
drop policy if exists "profiles_service_insert" on public.profiles;
create policy "profiles_service_insert"
  on public.profiles for insert
  with check (true);
