alter table public.admin_push_preferences
  add column if not exists sale_sound text not null default 'register';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_push_preferences_sale_sound_check'
      and conrelid = 'public.admin_push_preferences'::regclass
  ) then
    alter table public.admin_push_preferences
      add constraint admin_push_preferences_sale_sound_check
      check (sale_sound in ('register', 'coins', 'bell', 'spark', 'system'));
  end if;
end $$;
