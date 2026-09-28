-- Sticker Balance V1: multi-product inventory, permanent customer links, sales and phone access.
-- Run once in Supabase SQL Editor for project sjyclvtbcrgufhijzmim.
-- The existing customers table is preserved; this migration is additive.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists phone text;

create unique index if not exists customers_phone_per_code_idx
  on public.customers (customer_code, phone)
  where phone is not null;

create table if not exists public.sticker_products (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  reorder_level integer not null default 500 check (reorder_level >= 0),
  warning_level integer not null default 1000 check (warning_level >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(customer_id, name)
);

create table if not exists public.sticker_movements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.sticker_products(id) on delete cascade,
  movement_type text not null check (movement_type in ('delivery','usage')),
  quantity integer not null check (quantity > 0),
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.business_sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_name text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  amount numeric(14,2) not null default 0 check (amount >= 0),
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sticker_customer_access (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  access_code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists sticker_products_customer_idx on public.sticker_products(customer_id);
create index if not exists sticker_movements_customer_idx on public.sticker_movements(customer_id, created_at desc);
create index if not exists sticker_movements_product_idx on public.sticker_movements(product_id, created_at desc);
create index if not exists business_sales_customer_idx on public.business_sales(customer_id, sold_at desc);

create or replace function public.sb_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.sb_is_admin() from public;
grant execute on function public.sb_is_admin() to authenticated;

alter table public.sticker_products enable row level security;
alter table public.sticker_movements enable row level security;
alter table public.business_sales enable row level security;
alter table public.sticker_customer_access enable row level security;

drop policy if exists "sb admin products" on public.sticker_products;
create policy "sb admin products" on public.sticker_products
  for all to authenticated
  using ((select public.sb_is_admin()))
  with check ((select public.sb_is_admin()));

drop policy if exists "sb admin movements" on public.sticker_movements;
create policy "sb admin movements" on public.sticker_movements
  for all to authenticated
  using ((select public.sb_is_admin()))
  with check ((select public.sb_is_admin()));

drop policy if exists "sb admin sales" on public.business_sales;
create policy "sb admin sales" on public.business_sales
  for all to authenticated
  using ((select public.sb_is_admin()))
  with check ((select public.sb_is_admin()));

drop policy if exists "sb admin access" on public.sticker_customer_access;
create policy "sb admin access" on public.sticker_customer_access
  for all to authenticated
  using ((select public.sb_is_admin()))
  with check ((select public.sb_is_admin()));

grant select, insert, update, delete on public.sticker_products to authenticated;
grant select, insert, update, delete on public.sticker_movements to authenticated;
grant select, insert, update, delete on public.business_sales to authenticated;
grant select, insert, update, delete on public.sticker_customer_access to authenticated;

create or replace function public.sb_get_admin_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not public.sb_is_admin() then
    raise exception 'Not authorized';
  end if;

  select jsonb_build_object(
    'customers', coalesce((
      select jsonb_agg(row_to_json(c) order by c.business_name)
      from (
        select
          c.id, c.customer_code, c.business_name, c.contact_name, c.phone,
          c.is_active,
          coalesce((
            select jsonb_agg(jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'reorder_level', p.reorder_level,
              'warning_level', p.warning_level,
              'delivered', coalesce((select sum(m.quantity) from public.sticker_movements m where m.product_id=p.id and m.movement_type='delivery'),0),
              'used', coalesce((select sum(m.quantity) from public.sticker_movements m where m.product_id=p.id and m.movement_type='usage'),0),
              'remaining', greatest(0,
                coalesce((select sum(m.quantity) from public.sticker_movements m where m.product_id=p.id and m.movement_type='delivery'),0)
                - coalesce((select sum(m.quantity) from public.sticker_movements m where m.product_id=p.id and m.movement_type='usage'),0)
              )
            ) order by p.name)
            from public.sticker_products p where p.customer_id=c.id and p.active
          ), '[]'::jsonb) as products,
          (select count(*) from public.business_sales s where s.customer_id=c.id) as sales_count,
          (select access_code from public.sticker_customer_access a where a.customer_id=c.id and a.active) as access_code
        from public.customers c
        where c.is_active is distinct from false
      ) c
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

create or replace function public.sb_create_customer(
  p_business_name text,
  p_customer_name text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  cid uuid;
  code text;
  access text;
begin
  if not public.sb_is_admin() then raise exception 'Not authorized'; end if;
  if nullif(trim(p_business_name),'') is null then raise exception 'Business name is required'; end if;
  if nullif(trim(p_phone),'') is null then raise exception 'Phone number is required'; end if;

  code := upper(regexp_replace(trim(p_business_name), '[^A-Za-z0-9]+', '-', 'g')) || '-' || substr(replace(gen_random_uuid()::text,'-',''),1,6);

  insert into public.customers(business_name, customer_code, contact_name, phone, is_active)
  values(trim(p_business_name), code, nullif(trim(p_customer_name),''), regexp_replace(trim(p_phone),'[^0-9+]','','g'), true)
  returning id into cid;

  access := lower(substr(replace(gen_random_uuid()::text,'-',''),1,16));
  insert into public.sticker_customer_access(customer_id, access_code)
  values(cid, access);

  return jsonb_build_object('id',cid,'customer_code',code,'access_code',access);
end;
$$;

create or replace function public.sb_add_product(
  p_customer_id uuid,
  p_name text,
  p_reorder_level integer default 500,
  p_warning_level integer default 1000
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare pid uuid;
begin
  if not public.sb_is_admin() then raise exception 'Not authorized'; end if;
  insert into public.sticker_products(customer_id,name,reorder_level,warning_level)
  values(p_customer_id,trim(p_name),greatest(0,p_reorder_level),greatest(0,p_warning_level))
  returning id into pid;
  return pid;
end;
$$;

create or replace function public.sb_record_movement(
  p_product_id uuid,
  p_type text,
  p_quantity integer,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  pid uuid;
  cid uuid;
  delivered integer;
  used integer;
  remaining integer;
begin
  if not public.sb_is_admin() then raise exception 'Not authorized'; end if;
  if p_type not in ('delivery','usage') then raise exception 'Invalid movement'; end if;
  if p_quantity < 1 then raise exception 'Quantity must be at least 1'; end if;

  select id,customer_id into pid,cid from public.sticker_products where id=p_product_id and active;
  if pid is null then raise exception 'Product not found'; end if;

  select coalesce(sum(quantity),0) into delivered from public.sticker_movements where product_id=pid and movement_type='delivery';
  select coalesce(sum(quantity),0) into used from public.sticker_movements where product_id=pid and movement_type='usage';
  remaining := delivered-used;

  if p_type='usage' and p_quantity > remaining then raise exception 'Not enough stickers left'; end if;

  insert into public.sticker_movements(customer_id,product_id,movement_type,quantity,note,created_by)
  values(cid,pid,p_type,p_quantity,p_note,auth.uid());

  select coalesce(sum(quantity),0) into delivered from public.sticker_movements where product_id=pid and movement_type='delivery';
  select coalesce(sum(quantity),0) into used from public.sticker_movements where product_id=pid and movement_type='usage';

  return jsonb_build_object('delivered',delivered,'used',used,'remaining',greatest(0,delivered-used));
end;
$$;

create or replace function public.sb_record_customer_sale(
  p_access_code text,
  p_phone text,
  p_product_name text,
  p_quantity numeric,
  p_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare cid uuid; sid uuid; normalized_phone text;
begin
  normalized_phone := regexp_replace(trim(p_phone),'[^0-9+]','','g');
  select a.customer_id into cid
  from public.sticker_customer_access a
  join public.customers c on c.id=a.customer_id
  where a.access_code=p_access_code and a.active and c.phone=normalized_phone and c.is_active is distinct from false;
  if cid is null then raise exception 'Phone number is not correct'; end if;
  if nullif(trim(p_product_name),'') is null then raise exception 'Product is required'; end if;
  if p_quantity <= 0 or p_amount < 0 then raise exception 'Enter valid sale details'; end if;

  insert into public.business_sales(customer_id,product_name,quantity,amount)
  values(cid,trim(p_product_name),p_quantity,p_amount) returning id into sid;

  update public.sticker_customer_access set last_used_at=now() where access_code=p_access_code;
  return sid;
end;
$$;

create or replace function public.sb_customer_snapshot(
  p_access_code text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare cid uuid; normalized_phone text; result jsonb;
begin
  normalized_phone := regexp_replace(trim(p_phone),'[^0-9+]','','g');
  select a.customer_id into cid
  from public.sticker_customer_access a
  join public.customers c on c.id=a.customer_id
  where a.access_code=p_access_code and a.active and c.phone=normalized_phone and c.is_active is distinct from false;
  if cid is null then raise exception 'Phone number is not correct'; end if;

  update public.sticker_customer_access set last_used_at=now() where access_code=p_access_code;

  select jsonb_build_object(
    'customer', (select row_to_json(x) from (
      select c.id,c.business_name,c.contact_name,c.phone,c.customer_code
      from public.customers c where c.id=cid
    ) x),
    'products', coalesce((
      select jsonb_agg(row_to_json(p) order by p.name)
      from (
        select sp.id,sp.name,sp.reorder_level,sp.warning_level,
          coalesce((select sum(quantity) from public.sticker_movements m where m.product_id=sp.id and m.movement_type='delivery'),0) delivered,
          coalesce((select sum(quantity) from public.sticker_movements m where m.product_id=sp.id and m.movement_type='usage'),0) used,
          greatest(0,
            coalesce((select sum(quantity) from public.sticker_movements m where m.product_id=sp.id and m.movement_type='delivery'),0)
            - coalesce((select sum(quantity) from public.sticker_movements m where m.product_id=sp.id and m.movement_type='usage'),0)
          ) remaining
        from public.sticker_products sp where sp.customer_id=cid and sp.active
      ) p
    ),'[]'::jsonb),
    'sales', coalesce((
      select jsonb_agg(row_to_json(s) order by s.sold_at desc)
      from (select id,product_name,quantity,amount,sold_at from public.business_sales where customer_id=cid order by sold_at desc limit 50) s
    ),'[]'::jsonb),
    'movements', coalesce((
      select jsonb_agg(row_to_json(m) order by m.created_at desc)
      from (
        select sm.id,sp.name product_name,sm.movement_type,sm.quantity,sm.note,sm.created_at
        from public.sticker_movements sm join public.sticker_products sp on sp.id=sm.product_id
        where sm.customer_id=cid order by sm.created_at desc limit 50
      ) m
    ),'[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.sb_get_admin_snapshot() from public;
revoke all on function public.sb_create_customer(text,text,text) from public;
revoke all on function public.sb_add_product(uuid,text,integer,integer) from public;
revoke all on function public.sb_record_movement(uuid,text,integer,text) from public;
revoke all on function public.sb_record_customer_sale(text,text,text,numeric,numeric) from public;
revoke all on function public.sb_customer_snapshot(text,text) from public;

grant execute on function public.sb_get_admin_snapshot() to authenticated;
grant execute on function public.sb_create_customer(text,text,text) to authenticated;
grant execute on function public.sb_add_product(uuid,text,integer,integer) to authenticated;
grant execute on function public.sb_record_movement(uuid,text,integer,text) to authenticated;
grant execute on function public.sb_record_customer_sale(text,text,text,numeric,numeric) to anon, authenticated;
grant execute on function public.sb_customer_snapshot(text,text) to anon, authenticated;
