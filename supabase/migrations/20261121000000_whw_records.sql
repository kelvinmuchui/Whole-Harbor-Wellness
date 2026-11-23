-- Apply only to the dedicated Whole Harbor Wellness test Supabase project.
-- Demo rows are intentionally readable and writable by the public client.
-- Live rows remain protected by Firebase-backed policies below.

create table if not exists public.whw_records (
  collection text not null check (
    collection in (
      'users',
      'partners',
      'products',
      'orders',
      'partner_earnings',
      'wellness_programs',
      'educational_articles',
      'faqs',
      'testimonials',
      'inquiries',
      'analytics_events',
      'audit_logs'
    )
  ),
  record_id text not null check (length(record_id) between 1 and 128),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, record_id)
);

create index if not exists whw_records_collection_idx
  on public.whw_records (collection);
create index if not exists whw_records_uid_idx
  on public.whw_records ((data ->> 'uid'))
  where collection = 'users';
create index if not exists whw_records_owner_uid_idx
  on public.whw_records ((data ->> 'ownerUid'))
  where collection = 'partners';
create index if not exists whw_records_customer_uid_idx
  on public.whw_records ((data ->> 'customerUid'))
  where collection = 'orders';
create index if not exists whw_records_partner_owner_uid_idx
  on public.whw_records ((data ->> 'partnerOwnerUid'))
  where collection in ('orders', 'partner_earnings');

alter table public.whw_records enable row level security;
grant select, insert, update, delete on public.whw_records to anon, authenticated;

create or replace function public.whw_firebase_uid()
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

create or replace function public.whw_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    (
      auth.jwt() ->> 'email_verified' = 'true'
      and lower(coalesce(auth.jwt() ->> 'email', '')) in (
        'admin@wholeharborwellness.com',
        'muchuimalcolm423@gmail.com'
      )
    )
    or exists (
      select 1
      from public.whw_records as user_record
      where user_record.collection = 'users'
        and user_record.record_id = public.whw_firebase_uid()
        and not user_record.is_demo
        and user_record.data ->> 'role' in ('ADMIN', 'SALES_ADMIN')
    );
$$;

revoke all on function public.whw_firebase_uid() from public;
grant execute on function public.whw_firebase_uid() to anon, authenticated;
revoke all on function public.whw_is_admin() from public;
grant execute on function public.whw_is_admin() to anon, authenticated;

drop policy if exists whw_records_read on public.whw_records;
create policy whw_records_read
on public.whw_records for select to anon, authenticated
using (
  is_demo
  or collection in (
    'products',
    'wellness_programs',
    'educational_articles',
    'faqs',
    'testimonials'
  )
  or (collection = 'partners' and data ->> 'status' = 'APPROVED')
  or public.whw_is_admin()
  or (collection = 'users' and data ->> 'uid' = public.whw_firebase_uid())
  or (
    collection = 'partners'
    and data ->> 'ownerUid' = public.whw_firebase_uid()
  )
  or (
    collection = 'orders'
    and (
      data ->> 'customerUid' = public.whw_firebase_uid()
      or data ->> 'partnerOwnerUid' = public.whw_firebase_uid()
    )
  )
  or (
    collection = 'partner_earnings'
    and data ->> 'partnerOwnerUid' = public.whw_firebase_uid()
  )
  or (
    collection = 'inquiries'
    and data ->> 'userId' = public.whw_firebase_uid()
  )
);

drop policy if exists whw_records_insert on public.whw_records;
create policy whw_records_insert
on public.whw_records for insert to anon, authenticated
with check (
  (
    is_demo
    and collection in (
      'users',
      'partners',
      'products',
      'orders',
      'partner_earnings',
      'wellness_programs',
      'educational_articles',
      'faqs',
      'testimonials',
      'inquiries',
      'analytics_events',
      'audit_logs'
    )
  )
  or (not is_demo and public.whw_is_admin())
  or (
    not is_demo
    and collection = 'users'
    and record_id = public.whw_firebase_uid()
    and data ->> 'uid' = public.whw_firebase_uid()
    and data ->> 'role' in ('CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF')
  )
  or (
    not is_demo
    and collection = 'partners'
    and data ->> 'ownerUid' = public.whw_firebase_uid()
    and data ->> 'status' = 'NEW'
  )
  or (
    not is_demo
    and collection = 'orders'
    and data ->> 'customerUid' = public.whw_firebase_uid()
    and data ->> 'status' = 'PENDING'
    and data ->> 'paymentStatus' = 'PENDING'
  )
  or (
    not is_demo
    and collection = 'inquiries'
    and data ->> 'status' = 'NEW'
    and (
      data ->> 'userId' is null
      or data ->> 'userId' = public.whw_firebase_uid()
    )
  )
  or (
    not is_demo
    and collection = 'analytics_events'
    and data ->> 'eventType' in (
      'page_view',
      'product_view',
      'partner_visit',
      'add_to_cart',
      'checkout_completed',
      'search'
    )
  )
  or (
    not is_demo
    and collection = 'audit_logs'
    and data ->> 'userId' = public.whw_firebase_uid()
  )
);

drop policy if exists whw_records_update on public.whw_records;
create policy whw_records_update
on public.whw_records for update to anon, authenticated
using (is_demo or public.whw_is_admin())
with check (is_demo or public.whw_is_admin());

drop policy if exists whw_partner_owner_update on public.whw_records;
create policy whw_partner_owner_update
on public.whw_records for update to authenticated
using (
  not is_demo
  and collection = 'partners'
  and data ->> 'ownerUid' = public.whw_firebase_uid()
)
with check (
  not is_demo
  and collection = 'partners'
  and data ->> 'ownerUid' = public.whw_firebase_uid()
);

create or replace function public.whw_protect_partner_owner_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.collection = 'partners'
    and not old.is_demo
    and not public.whw_is_admin()
    and old.data ->> 'ownerUid' = public.whw_firebase_uid()
  then
    if new.collection <> old.collection
      or new.record_id <> old.record_id
      or new.is_demo <> old.is_demo
      or (new.data - array[
        'name',
        'businessName',
        'contactPerson',
        'phone',
        'description',
        'website',
        'address',
        'location',
        'logoUrl',
        'preferredCategories',
        'updatedAt'
      ]::text[]) <> (
        old.data - array[
          'name',
          'businessName',
          'contactPerson',
          'phone',
          'description',
          'website',
          'address',
          'location',
          'logoUrl',
          'preferredCategories',
          'updatedAt'
        ]::text[]
      )
    then
      raise exception 'Partner owners may only update their organization profile fields';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists whw_protect_partner_owner_update_trigger on public.whw_records;
create trigger whw_protect_partner_owner_update_trigger
before update on public.whw_records
for each row execute function public.whw_protect_partner_owner_update();

drop policy if exists whw_records_delete on public.whw_records;
create policy whw_records_delete
on public.whw_records for delete to anon, authenticated
using (is_demo or public.whw_is_admin());

create or replace function public.whw_prepare_live_order()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  partner_data jsonb;
  partner_rate numeric;
  eligible_sales numeric;
begin
  if new.collection <> 'orders' or new.is_demo then
    return new;
  end if;

  new.data := jsonb_set(new.data, '{status}', to_jsonb('PENDING'::text), true);
  new.data := jsonb_set(new.data, '{paymentStatus}', to_jsonb('PENDING'::text), true);

  if new.data ->> 'orderType' = 'WHOLESALE' then
    new.data := new.data || jsonb_build_object(
      'partnerCommission', 0,
      'commissionStatus', 'NONE'
    );
    new.data := new.data - 'partnerOwnerUid' - 'partnerCommissionRate';
    return new;
  end if;

  if nullif(new.data ->> 'partnerId', '') is null then
    new.data := new.data - 'partnerOwnerUid' - 'partnerCommission'
      - 'partnerCommissionRate' - 'commissionStatus';
    return new;
  end if;

  select partner_record.data
  into partner_data
  from public.whw_records as partner_record
  where partner_record.collection = 'partners'
    and not partner_record.is_demo
    and (
      partner_record.record_id = new.data ->> 'partnerId'
      or partner_record.data ->> 'partnerId' = new.data ->> 'partnerId'
    )
    and partner_record.data ->> 'status' = 'APPROVED'
  limit 1;

  if partner_data is null then
    raise exception 'Referral partner is not an approved live partner';
  end if;

  partner_rate := coalesce((partner_data ->> 'commissionRate')::numeric, 0);
  eligible_sales := greatest(
    coalesce((new.data ->> 'subtotal')::numeric, 0)
      - coalesce((new.data ->> 'partnerDiscount')::numeric, 0),
    0
  );
  new.data := new.data || jsonb_build_object(
    'partnerOwnerUid', partner_data ->> 'ownerUid',
    'partnerCommission', round(eligible_sales * partner_rate, 2),
    'partnerCommissionRate', partner_rate,
    'commissionStatus', 'PENDING'
  );

  return new;
end;
$$;

create or replace function public.whw_create_live_partner_earning()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  earning_id text;
  earning_data jsonb;
begin
  if new.collection <> 'orders'
    or new.is_demo
    or nullif(new.data ->> 'partnerId', '') is null
    or coalesce((new.data ->> 'partnerCommission')::numeric, 0) <= 0
  then
    return new;
  end if;

  earning_id := 'earn-' || new.record_id;
  earning_data := jsonb_build_object(
    'id', earning_id,
    'partnerId', new.data ->> 'partnerId',
    'partnerSlug', coalesce(new.data ->> 'partnerSlug', ''),
    'partnerOwnerUid', new.data ->> 'partnerOwnerUid',
    'orderId', new.record_id,
    'orderNumber', new.data ->> 'orderNumber',
    'customerName', new.data ->> 'customerName',
    'grossSales', coalesce((new.data ->> 'subtotal')::numeric, 0),
    'eligibleSales', greatest(
      coalesce((new.data ->> 'subtotal')::numeric, 0)
        - coalesce((new.data ->> 'partnerDiscount')::numeric, 0),
      0
    ),
    'commissionRate', coalesce((new.data ->> 'partnerCommissionRate')::numeric, 0),
    'earningAmount', (new.data ->> 'partnerCommission')::numeric,
    'status', 'PENDING',
    'createdAt', new.data ->> 'createdAt'
  );

  insert into public.whw_records (collection, record_id, data, is_demo)
  values ('partner_earnings', earning_id, earning_data, false)
  on conflict (collection, record_id) do nothing;

  return new;
end;
$$;

drop trigger if exists whw_prepare_live_order_trigger on public.whw_records;
create trigger whw_prepare_live_order_trigger
before insert on public.whw_records
for each row execute function public.whw_prepare_live_order();

drop trigger if exists whw_create_live_partner_earning_trigger on public.whw_records;
create trigger whw_create_live_partner_earning_trigger
after insert on public.whw_records
for each row execute function public.whw_create_live_partner_earning();
