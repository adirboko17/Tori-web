-- Push notifications for the site super-admin mobile app.
--
-- Only the service role (the website server) reads or writes these tables.
-- RLS is enabled with no policies, and anon/authenticated lose all grants.
--
-- After applying, store the webhook target in Vault (once per project):
--   select vault.create_secret('https://<APP_URL>/api/admin/push/db-event', 'admin_push_webhook_url');
--   select vault.create_secret('<same value as ADMIN_PUSH_WEBHOOK_SECRET>', 'admin_push_webhook_secret');
-- Until both secrets exist the triggers are silent no-ops.

create extension if not exists pg_net;

create table if not exists public.admin_push_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_phone_id uuid not null references public.site_admin_phones (id) on delete cascade,
  expo_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  device_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_phone_id, device_id)
);

create table if not exists public.admin_push_preferences (
  admin_phone_id uuid primary key references public.site_admin_phones (id) on delete cascade,
  enabled boolean not null default true,
  types jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_push_events (
  event_key text primary key,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  recipients integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists admin_push_events_created_at_idx
  on public.admin_push_events (created_at);

alter table public.admin_push_tokens enable row level security;
alter table public.admin_push_preferences enable row level security;
alter table public.admin_push_events enable row level security;

revoke all on public.admin_push_tokens from anon, authenticated;
revoke all on public.admin_push_preferences from anon, authenticated;
revoke all on public.admin_push_events from anon, authenticated;

-- Fire-and-forget POST to the website. Errors are swallowed so a push problem
-- can never block an insert coming from the salon apps or the WhatsApp bot.
create or replace function public.admin_push_notify(payload jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  hook_url text;
  hook_secret text;
begin
  select decrypted_secret into hook_url
    from vault.decrypted_secrets where name = 'admin_push_webhook_url' limit 1;
  select decrypted_secret into hook_secret
    from vault.decrypted_secrets where name = 'admin_push_webhook_secret' limit 1;
  if coalesce(hook_url, '') = '' or coalesce(hook_secret, '') = '' then
    return;
  end if;
  perform net.http_post(
    url := hook_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-tori-webhook-secret', hook_secret
    ),
    timeout_milliseconds := 5000
  );
exception when others then
  raise warning 'admin_push_notify failed: %', sqlerrm;
end;
$$;

revoke all on function public.admin_push_notify(jsonb) from public, anon, authenticated;

create or replace function public.admin_push_on_new_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.admin_push_notify(jsonb_build_object(
    'type', 'new_client',
    'record', jsonb_build_object(
      'id', new.id,
      'name', new.name,
      'business_id', new.business_id
    )
  ));
  return new;
end;
$$;

revoke all on function public.admin_push_on_new_client() from public, anon, authenticated;

drop trigger if exists admin_push_new_client on public.users;
create trigger admin_push_new_client
  after insert on public.users
  for each row
  when (new.user_type = 'client')
  execute function public.admin_push_on_new_client();

create or replace function public.admin_push_on_whatsapp_human()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;
  perform public.admin_push_notify(jsonb_build_object(
    'type', 'whatsapp_human',
    'record', jsonb_build_object('phone', new.phone, 'name', new.name),
    'at', now()
  ));
  return new;
end;
$$;

revoke all on function public.admin_push_on_whatsapp_human() from public, anon, authenticated;

drop trigger if exists admin_push_whatsapp_human on public.wa_conversations;
create trigger admin_push_whatsapp_human
  after insert or update of status on public.wa_conversations
  for each row
  when (new.status = 'human')
  execute function public.admin_push_on_whatsapp_human();

-- Balance sweep 4 times a day (UTC). Each alert is still sent at most once a
-- day per business / for the main account, deduped by admin_push_events.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'admin-push-balance-sweep';
    perform cron.schedule(
      'admin-push-balance-sweep',
      '15 6,10,14,18 * * *',
      $cron$select public.admin_push_notify('{"type":"balance_check"}'::jsonb)$cron$
    );
  end if;
end;
$$;
