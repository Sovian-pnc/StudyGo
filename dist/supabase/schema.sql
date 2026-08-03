-- StudyGo: initial Supabase schema
-- Run in Supabase Dashboard → SQL Editor as a database owner.
-- This file is not executed by the static site and contains no secrets.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ru text not null,
  name_en text,
  institution_type text not null check (institution_type in ('school', 'college', 'university')),
  city text not null,
  province text,
  country text not null default 'Китай',
  tuition_rmb integer check (tuition_rmb is null or tuition_rmb >= 0),
  studygo_service_usd integer check (studygo_service_usd is null or studygo_service_usd >= 0),
  admissions_open boolean not null default false,
  accepts_minors boolean not null default false,
  has_dormitory boolean not null default false,
  has_grant boolean not null default false,
  partner boolean not null default false,
  official_url text,
  source_url text,
  source_checked_at date,
  source_status text not null default 'needs_review' check (source_status in ('verified', 'needs_review', 'archived')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.institution_media (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  storage_path text,
  external_url text,
  alt_text text,
  caption text,
  license_note text,
  attribution_url text,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint institution_media_has_source check (storage_path is not null or external_url is not null)
);

create table if not exists public.student_passports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  education_stage text,
  age integer check (age is null or age between 10 and 100),
  chinese_level text,
  goal text,
  readiness_percent smallint not null default 0 check (readiness_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  storage_path text,
  status text not null default 'not_started' check (status in ('not_started', 'uploaded', 'approved', 'needs_revision')),
  note text,
  updated_at timestamptz not null default now(),
  unique (user_id, document_type)
);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  contact text not null check (char_length(contact) between 3 and 160),
  source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists institutions_catalog_idx on public.institutions (institution_type, city, admissions_open, source_status);
create index if not exists institution_media_sort_idx on public.institution_media (institution_id, is_cover desc, sort_order);
create index if not exists student_documents_user_idx on public.student_documents (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Every Auth user receives a matching profile. This is required before assigning staff/admin roles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
revoke all on function public.handle_new_user() from public;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists institutions_set_updated_at on public.institutions;
create trigger institutions_set_updated_at before update on public.institutions for each row execute function public.set_updated_at();
drop trigger if exists passports_set_updated_at on public.student_passports;
create trigger passports_set_updated_at before update on public.student_passports for each row execute function public.set_updated_at();
drop trigger if exists documents_set_updated_at on public.student_documents;
create trigger documents_set_updated_at before update on public.student_documents for each row execute function public.set_updated_at();

-- Keep the admin role helper away from exposed API schemas. Policies can use it,
-- but visitors cannot call it directly through PostgREST.
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public;
revoke all on function private.is_admin() from anon;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_media enable row level security;
alter table public.student_passports enable row level security;
alter table public.student_documents enable row level security;
alter table public.consultation_requests enable row level security;

-- Remove old policies if this schema is re-run.
drop policy if exists profiles_read_own on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists institutions_public_read on public.institutions;
drop policy if exists institutions_admin_manage on public.institutions;
drop policy if exists media_public_read on public.institution_media;
drop policy if exists media_admin_manage on public.institution_media;
drop policy if exists passports_own on public.student_passports;
drop policy if exists passports_admin_read on public.student_passports;
drop policy if exists documents_own on public.student_documents;
drop policy if exists documents_admin_read on public.student_documents;
drop policy if exists consultations_public_insert on public.consultation_requests;
drop policy if exists consultations_admin_read on public.consultation_requests;

create policy profiles_read_own on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_admin_read on public.profiles for select to authenticated using ((select private.is_admin()));

create policy institutions_public_read on public.institutions for select to anon, authenticated using (source_status = 'verified');
create policy institutions_admin_manage on public.institutions for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy media_public_read on public.institution_media for select to anon, authenticated using (
  exists (
    select 1 from public.institutions
    where institutions.id = institution_media.institution_id
      and institutions.source_status = 'verified'
  )
);
create policy media_admin_manage on public.institution_media for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy passports_own on public.student_passports for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy passports_admin_read on public.student_passports for select to authenticated using ((select private.is_admin()));
create policy documents_own on public.student_documents for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy documents_admin_read on public.student_documents for select to authenticated using ((select private.is_admin()));

create policy consultations_admin_read on public.consultation_requests for select to authenticated using ((select private.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.institutions, public.institution_media to anon, authenticated;
grant select on public.profiles, public.student_passports, public.student_documents, public.consultation_requests to authenticated;
grant insert, update, delete on public.institutions, public.institution_media, public.student_passports, public.student_documents to authenticated;
-- Public forms never write to PostgREST directly. The Vercel server function uses the
-- service role key privately, so anonymous visitors do not receive INSERT permissions.

-- Private media bucket. Create this from SQL Editor; uploads remain limited by the policies below.
insert into storage.buckets (id, name, public)
values ('institution-media', 'institution-media', false)
on conflict (id) do update set public = false;

drop policy if exists "StudyGo admins manage institution media" on storage.objects;
drop policy if exists "StudyGo admins read institution media" on storage.objects;
create policy "StudyGo admins manage institution media" on storage.objects for all to authenticated
  using (bucket_id = 'institution-media' and (select private.is_admin()))
  with check (bucket_id = 'institution-media' and (select private.is_admin()));
create policy "StudyGo admins read institution media" on storage.objects for select to authenticated
  using (bucket_id = 'institution-media' and (select private.is_admin()));

-- First administrator: create the user in Authentication → Users, then run once with its UUID.
-- update public.profiles set role = 'admin' where id = 'USER_UUID';
