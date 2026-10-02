-- Personal area for a customer who signed up and paid.
-- The website server uses the service role. Visitors cannot read this table.

create table if not exists public.site_customer_accounts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  full_name text not null,
  business_name text not null,
  agreement_accepted_at timestamptz,
  paid_at timestamptz,
  business_id uuid references public.business_profile (id) on delete set null,
  user_id uuid references public.users (id) on delete set null,
  email text,
  app_name_en text,
  address text,
  id_number text,
  receipt_name text,
  receipt_vat text,
  language text not null default 'he',
  brand_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_customer_accounts_phone_check check (phone ~ '^05[0-9]{8}$'),
  constraint site_customer_accounts_full_name_check check (char_length(full_name) >= 2),
  constraint site_customer_accounts_business_name_check check (char_length(business_name) >= 2),
  constraint site_customer_accounts_language_check check (language in ('he', 'en', 'ru', 'ar')),
  constraint site_customer_accounts_brand_color_check check (
    brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint site_customer_accounts_id_number_check check (
    id_number is null or id_number ~ '^[0-9]{9}$'
  ),
  constraint site_customer_accounts_receipt_vat_check check (
    receipt_vat is null or receipt_vat ~ '^[0-9]{9}$'
  )
);

create index if not exists site_customer_accounts_phone_idx
  on public.site_customer_accounts (phone);

create unique index if not exists site_customer_accounts_business_id_uidx
  on public.site_customer_accounts (business_id)
  where business_id is not null;

create unique index if not exists site_customer_accounts_user_id_uidx
  on public.site_customer_accounts (user_id)
  where user_id is not null;

alter table public.site_customer_accounts enable row level security;

revoke all on public.site_customer_accounts from anon, authenticated;
grant all on public.site_customer_accounts to service_role;

-- Customers who already have an active standing order can sign in immediately.
do $$
declare
  rec record;
  raw jsonb;
  biz uuid;
  admin_row record;
  digits text;
  normalized text;
begin
  for rec in
    select label
    from public.site_sms_packages
    where package_key like 'payplus_sub_%'
  loop
    begin
      raw := rec.label::jsonb;
    exception when others then
      continue;
    end;

    if coalesce(raw->>'status', 'active') = 'cancelled' then
      continue;
    end if;

    begin
      biz := nullif(coalesce(raw->>'businessId', raw->>'business_id'), '')::uuid;
    exception when others then
      continue;
    end;

    if biz is null then
      continue;
    end if;

    if exists (
      select 1 from public.site_customer_accounts where business_id = biz
    ) then
      continue;
    end if;

    select
      u.id,
      u.name,
      u.phone,
      u.language,
      bp.display_name,
      bp.address,
      bp.branding_client_name,
      bp.primary_color,
      bp.created_at
    into admin_row
    from public.users u
    join public.business_profile bp on bp.id = biz
    where u.business_id = biz
      and u.user_type = 'admin'
      and u.block = false
    order by u.created_at
    limit 1;

    if admin_row.id is null then
      continue;
    end if;

    digits := regexp_replace(coalesce(admin_row.phone, ''), '\D', '', 'g');
    if digits ~ '^9725[0-9]{8}$' then
      normalized := '0' || substring(digits from 4);
    elsif digits ~ '^05[0-9]{8}$' then
      normalized := digits;
    elsif digits ~ '^5[0-9]{8}$' then
      normalized := '0' || digits;
    else
      continue;
    end if;

    insert into public.site_customer_accounts (
      phone,
      full_name,
      business_name,
      agreement_accepted_at,
      paid_at,
      business_id,
      user_id,
      address,
      app_name_en,
      brand_color,
      language
    ) values (
      normalized,
      admin_row.name,
      coalesce(nullif(admin_row.display_name, ''), admin_row.name),
      coalesce(admin_row.created_at, now()),
      now(),
      biz,
      admin_row.id,
      nullif(admin_row.address, ''),
      nullif(admin_row.branding_client_name, ''),
      case
        when admin_row.primary_color ~ '^#[0-9A-Fa-f]{6}$' then admin_row.primary_color
        else null
      end,
      case
        when admin_row.language in ('he', 'en', 'ru', 'ar') then admin_row.language
        else 'he'
      end
    );
  end loop;
end $$;
