-- Where I'm Watching v1.1
-- Streaming-service preferences, moderation, admin access, and app versioning.

create extension if not exists pgcrypto;

create table if not exists public.streaming_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  moderation_status text not null default 'pending'
    check (moderation_status in ('verified', 'pending', 'rejected')),
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  submission_count integer not null default 1 check (submission_count > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_streaming_services (
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.streaming_services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

create table if not exists public.user_service_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  configured_at timestamptz not null default now()
);

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_config (key, value)
values ('current_version', '1.1.0')
on conflict (key) do update
set value = excluded.value, updated_at = now();

insert into public.streaming_services (name, normalized_name, moderation_status, submission_count)
values
  ('Netflix', 'netflix', 'verified', 1),
  ('Hulu', 'hulu', 'verified', 1),
  ('Max', 'max', 'verified', 1),
  ('Apple TV+', 'apple tv+', 'verified', 1),
  ('Paramount+', 'paramount+', 'verified', 1),
  ('Peacock', 'peacock', 'verified', 1),
  ('Prime Video', 'prime video', 'verified', 1),
  ('Disney+', 'disney+', 'verified', 1)
on conflict (normalized_name) do nothing;

-- Preserve any service names that were already in users' watchlists before
-- v1.1, including custom values entered through the old free-form combobox.
insert into public.streaming_services (
  name, normalized_name, moderation_status, submitted_by_user_id, submission_count
)
select distinct on (normalized_name)
  service_name, normalized_name, 'pending', user_id, 1
from (
  select
    user_id,
    trim(service) as service_name,
    lower(regexp_replace(trim(service), '\\s+', ' ', 'g')) as normalized_name
  from public.user_shows
  where trim(service) <> ''
) existing_services
order by normalized_name, user_id
on conflict (normalized_name) do nothing;

-- Preserve existing users' actual service usage as selected service rows, but do
-- not mark My Services as explicitly configured until the user changes a checkbox.
insert into public.user_streaming_services (user_id, service_id)
select distinct us.user_id, ss.id
from public.user_shows us
join public.streaming_services ss
  on ss.normalized_name = lower(regexp_replace(trim(us.service), '\s+', ' ', 'g'))
on conflict (user_id, service_id) do nothing;

alter table public.streaming_services enable row level security;
alter table public.user_streaming_services enable row level security;
alter table public.user_service_settings enable row level security;
alter table public.app_admins enable row level security;
alter table public.app_config enable row level security;

-- Everyone can read verified catalog entries. A signed-in submitter can also
-- keep using their own pending/private entries.
drop policy if exists "read visible streaming services" on public.streaming_services;
create policy "read visible streaming services"
on public.streaming_services for select
using (
  moderation_status = 'verified'
  or submitted_by_user_id = auth.uid()
  or exists (select 1 from public.user_streaming_services uss where uss.service_id = streaming_services.id and uss.user_id = auth.uid())
  or exists (select 1 from public.app_admins a where a.user_id = auth.uid())
);

drop policy if exists "users read own service selections" on public.user_streaming_services;
create policy "users read own service selections"
on public.user_streaming_services for select
using (user_id = auth.uid());

drop policy if exists "users add own service selections" on public.user_streaming_services;
create policy "users add own service selections"
on public.user_streaming_services for insert
with check (user_id = auth.uid());

drop policy if exists "users remove own service selections" on public.user_streaming_services;
create policy "users remove own service selections"
on public.user_streaming_services for delete
using (user_id = auth.uid());

drop policy if exists "users read own service settings" on public.user_service_settings;
create policy "users read own service settings"
on public.user_service_settings for select
using (user_id = auth.uid());

drop policy if exists "users create own service settings" on public.user_service_settings;
create policy "users create own service settings"
on public.user_service_settings for insert
with check (user_id = auth.uid());

drop policy if exists "users update own service settings" on public.user_service_settings;
create policy "users update own service settings"
on public.user_service_settings for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "admins can identify themselves" on public.app_admins;
create policy "admins can identify themselves"
on public.app_admins for select
using (user_id = auth.uid());

drop policy if exists "read app config" on public.app_config;
create policy "read app config"
on public.app_config for select
using (true);

grant select on public.streaming_services to anon, authenticated;
grant select, insert, delete on public.user_streaming_services to authenticated;
grant select, insert, update on public.user_service_settings to authenticated;
grant select on public.app_admins to authenticated;
grant select on public.app_config to anon, authenticated;

-- Keep the service role permissions explicit for Edge Functions.
grant select, insert, update, delete on public.streaming_services to service_role;
grant select, insert, update, delete on public.user_streaming_services to service_role;
grant select, insert, update, delete on public.user_service_settings to service_role;
grant select on public.app_admins to service_role;
grant select, insert, update, delete on public.user_shows to service_role;

-- After running this migration, add your own auth user as an app admin once:
-- insert into public.app_admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
