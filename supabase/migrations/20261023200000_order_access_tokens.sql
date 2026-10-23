-- TarhanaTerapi — tek sipariş erişim token'ı
-- Sipariş onay e-postasındaki bağlantı, yalnızca o siparişi görüntülemek için
-- rastgele bir token taşır. Veritabanında token'ın yalnızca SHA-256 özeti tutulur.

alter table public.orders
  add column if not exists access_token_hash text,
  add column if not exists access_token_created_at timestamptz,
  add column if not exists access_token_expires_at timestamptz;

create unique index if not exists orders_access_token_hash_idx
  on public.orders (access_token_hash)
  where access_token_hash is not null;

comment on column public.orders.access_token_hash is
  'Sipariş erişim token''ının SHA-256 özeti; ham token yalnızca e-postada.';
comment on column public.orders.access_token_created_at is
  'Sipariş erişim token''ının oluşturulma zamanı.';
comment on column public.orders.access_token_expires_at is
  'Sipariş erişim token''ının son geçerlilik zamanı.';
