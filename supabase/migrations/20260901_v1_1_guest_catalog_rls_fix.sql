-- Fix guest/anonymous catalog reads.
-- The original policy mixed the public verified-catalog rule with authenticated
-- subqueries. Anonymous clients can read streaming_services, but do not have
-- access to the authenticated-only tables referenced by those subqueries.
-- Keep the public rule completely independent and scope account-only rules to
-- the authenticated role.

drop policy if exists "read visible streaming services" on public.streaming_services;
drop policy if exists "read verified streaming services" on public.streaming_services;
drop policy if exists "users read own submitted streaming services" on public.streaming_services;
drop policy if exists "users read selected streaming services" on public.streaming_services;
drop policy if exists "admins read all streaming services" on public.streaming_services;

create policy "read verified streaming services"
on public.streaming_services
for select
to anon, authenticated
using (moderation_status = 'verified');

create policy "users read own submitted streaming services"
on public.streaming_services
for select
to authenticated
using (submitted_by_user_id = auth.uid());

create policy "users read selected streaming services"
on public.streaming_services
for select
to authenticated
using (
  exists (
    select 1
    from public.user_streaming_services uss
    where uss.service_id = streaming_services.id
      and uss.user_id = auth.uid()
  )
);

create policy "admins read all streaming services"
on public.streaming_services
for select
to authenticated
using (
  exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
  )
);
