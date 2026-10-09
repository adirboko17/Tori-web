alter table public.site_live_sessions
  add column if not exists visitor_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'site_live_sessions_visitor_key_check'
  ) then
    alter table public.site_live_sessions
      add constraint site_live_sessions_visitor_key_check
      check (visitor_key is null or char_length(visitor_key) between 16 and 64);
  end if;
end $$;
