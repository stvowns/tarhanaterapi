-- TarhanaTerapi — sipariş sahipliği
--
-- `customer_id` mevcut müşteri kayıtlarına işaret eder; Supabase Auth
-- kullanıcıları ayrı bir tabloda tutulduğu için sipariş geçmişi sahipliği
-- `auth_user_id` ile bağlanır. Eski siparişler bilinçli olarak boş bırakılır;
-- e-posta ile geriye dönük eşleştirme yapılmaz.

alter table public.orders
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_auth_user_id_idx
  on public.orders (auth_user_id);

comment on column public.orders.auth_user_id is
  'Siparişi veren Supabase Auth kullanıcısı; yalnızca sunucu tarafından doğrulanmış oturumla doldurulur.';
