do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'whw_records'
  ) then
    alter publication supabase_realtime add table public.whw_records;
  end if;
end;
$$;
