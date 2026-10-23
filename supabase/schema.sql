create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null,
  original_price numeric,
  weight text,
  category text,
  rating numeric default 0,
  reviews_count integer default 0,
  in_stock boolean default true,
  updated_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text,
  city text,
  district text,
  address text,
  points integer default 0,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references customers(id),
  auth_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_city text not null,
  customer_district text not null,
  payment_method text not null,
  subtotal numeric not null,
  shipping_fee numeric default 0,
  discount numeric default 0,
  total numeric not null,
  status text not null default 'Yeni Sipariş',
  items jsonb default '[]'::jsonb,
  delivery_note text,
  payment_status text default 'Bekliyor',
  payment_provider text,
  access_token_hash text,
  access_token_created_at timestamptz,
  access_token_expires_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create unique index if not exists orders_access_token_hash_idx
  on orders (access_token_hash)
  where access_token_hash is not null;

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text references products(id),
  name text not null,
  price numeric not null,
  quantity integer not null,
  weight text
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null check (source in ('ebook', 'newsletter')),
  unsubscribed_at timestamptz,
  marketing_consent boolean not null default false,
  consent_at timestamptz,
  consent_version text,
  consent_source text,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  location text,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  product_name text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position integer default 0,
  updated_at timestamptz default now()
);

alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscribers enable row level security;
alter table reviews enable row level security;
alter table faq enable row level security;

-- Public read for product, faq, reviews
create policy "public read products" on products for select using (true);
create policy "public read faq" on faq for select using (true);
-- Yalnızca onaylanmış yorumlar herkese açıktır. Onay bekleyenler service role ile okunur.
create policy "public read approved reviews" on reviews for select using (verified = true);

-- Sipariş, sipariş kalemi ve bülten kayıtları yalnızca Cloudflare Functions
-- tarafından service role anahtarıyla yazılır. Anon insert politikası verilmez;
-- aksi halde herkes Supabase anon anahtarıyla doğrudan sahte sipariş/abone ekleyebilir.
-- Oturum açmış kullanıcı yalnızca kendi auth_user_id kayıtlarını okuyabilir;
-- e-posta tek başına sahiplik kanıtı değildir.
create policy "users can read own orders" on orders
  for select to authenticated
  using (auth_user_id = auth.uid());

revoke insert, update, delete on orders from anon, authenticated;

create index if not exists orders_customer_email_idx on orders (customer_email);
create index if not exists orders_auth_user_id_idx on orders (auth_user_id);

-- Admin policies can be narrowed with JWT claim in production.

-- Uygulama düzeyinde kalıcı rate limit (Cloudflare kuralına ek katman).
create table if not exists rate_limit_buckets (
  bucket_key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

create index if not exists rate_limit_buckets_window_start_idx
  on rate_limit_buckets (window_start);

alter table rate_limit_buckets enable row level security;
revoke all on rate_limit_buckets from anon, authenticated;

create or replace function consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_hits integer;
begin
  if p_key is null or length(p_key) = 0 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into rate_limit_buckets as buckets (bucket_key, window_start, hits)
  values (p_key, v_now, 1)
  on conflict (bucket_key) do update
    set window_start = case
          when buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
          then v_now else buckets.window_start end,
        hits = case
          when buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
          then 1 else buckets.hits + 1 end
  returning hits into v_hits;

  if random() < 0.01 then
    delete from rate_limit_buckets where window_start < v_now - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function consume_rate_limit(text, integer, integer)
  to service_role;
