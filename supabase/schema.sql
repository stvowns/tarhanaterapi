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
  created_at timestamptz default now()
);

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
create policy "public read reviews" on reviews for select using (true);

-- Order insert for anon (checkout), read by matching email handled by service role in API
create policy "anon insert orders" on orders for insert with check (true);
create policy "anon insert order_items" on order_items for insert with check (true);
create policy "anon insert subscribers" on subscribers for insert with check (true);

-- Admin policies can be narrowed with JWT claim in production.
