-- Failed access-code attempts for the site-admin mobile app.
-- Only the website server (service role) reads or writes this table.
-- RLS is enabled with no policies, and anon/authenticated lose all grants.

create table if not exists public.site_admin_login_attempts (
  phone text primary key check (phone ~ '^05[0-9]{8}$'),
  failed_attempts integer not null default 0 check (failed_attempts >= 0 and failed_attempts <= 20),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.site_admin_login_attempts enable row level security;

revoke all on public.site_admin_login_attempts from anon, authenticated;

create or replace function public.site_admin_login_lock_status(p_phone text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  lock_at timestamptz;
begin
  if p_phone is null or p_phone !~ '^05[0-9]{8}$' then
    return false;
  end if;
  select attempts.locked_until into lock_at
  from public.site_admin_login_attempts as attempts
  where attempts.phone = p_phone;
  return lock_at is not null and lock_at > now();
end;
$$;

create or replace function public.site_admin_note_login_failure(
  p_phone text,
  p_max_failures integer,
  p_lock_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_ts timestamptz := now();
  current_failed integer;
  current_lock timestamptz;
  next_failed integer;
  next_lock timestamptz;
begin
  if p_phone is null or p_phone !~ '^05[0-9]{8}$' then
    return false;
  end if;
  if p_max_failures < 1 or p_lock_seconds < 1 then
    raise exception 'invalid login lock settings';
  end if;

  insert into public.site_admin_login_attempts as attempts (phone, failed_attempts, locked_until, updated_at)
  values (p_phone, 0, null, now_ts)
  on conflict (phone) do nothing;

  select attempts.failed_attempts, attempts.locked_until
    into current_failed, current_lock
  from public.site_admin_login_attempts as attempts
  where attempts.phone = p_phone
  for update;

  if current_lock is not null and current_lock > now_ts then
    return true;
  end if;

  if current_lock is not null and current_lock <= now_ts then
    current_failed := 0;
  end if;
  current_failed := coalesce(current_failed, 0);

  next_failed := current_failed + 1;
  if next_failed >= p_max_failures then
    next_lock := now_ts + make_interval(secs => p_lock_seconds);
  else
    next_lock := null;
  end if;

  update public.site_admin_login_attempts
     set failed_attempts = next_failed,
         locked_until = next_lock,
         updated_at = now_ts
   where phone = p_phone;

  return next_lock is not null;
end;
$$;

create or replace function public.site_admin_clear_login_failures(p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_phone is null or p_phone !~ '^05[0-9]{8}$' then
    return;
  end if;
  update public.site_admin_login_attempts
     set failed_attempts = 0,
         locked_until = null,
         updated_at = now()
   where phone = p_phone;
end;
$$;

revoke all on function public.site_admin_login_lock_status(text) from public, anon, authenticated;
revoke all on function public.site_admin_note_login_failure(text, integer, integer) from public, anon, authenticated;
revoke all on function public.site_admin_clear_login_failures(text) from public, anon, authenticated;

grant execute on function public.site_admin_login_lock_status(text) to service_role;
grant execute on function public.site_admin_note_login_failure(text, integer, integer) to service_role;
grant execute on function public.site_admin_clear_login_failures(text) to service_role;
