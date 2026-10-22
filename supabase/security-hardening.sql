-- TarhanaTerapi — Supabase güvenlik sertleştirmesi
-- Supabase Dashboard > SQL Editor içinde bir kez çalıştırın.
--
-- Neden: Bu politikalar kaldırılmadan, public anon anahtarına sahip herkes
-- Cloudflare Functions API'sini atlayarak doğrudan sahte sipariş, sipariş kalemi
-- veya bülten abonesi ekleyebilir. Siparişler artık yalnızca service role ile
-- çalışan /api/create-order üzerinden yazılır.

drop policy if exists "anon insert orders" on orders;
drop policy if exists "anon insert order_items" on order_items;
drop policy if exists "anon insert subscribers" on subscribers;

-- İsim ne olursa olsun, bu üç tabloya anon/authenticated INSERT politikası bırakma.
-- Yazma işlemleri service role ile yapıldığı için RLS politikasına ihtiyaç yoktur.
do $$
declare policy_row record;
begin
  for policy_row in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items', 'subscribers')
      and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on %I', policy_row.policyname, policy_row.tablename);
  end loop;
end $$;

-- Onay bekleyen yorumların public anon anahtarıyla okunmasını engelle.
drop policy if exists "public read reviews" on reviews;
drop policy if exists "public read approved reviews" on reviews;
create policy "public read approved reviews" on reviews for select using (verified = true);

-- Abonelikten çıkma kaydını Supabase tarafında da tutmak için.
alter table subscribers
  add column if not exists unsubscribed_at timestamptz;

create index if not exists orders_customer_email_idx on orders (customer_email);

-- Kontrol: Aşağıdaki sorgu yalnızca public read politikalarını ve RLS'in açık
-- olduğunu göstermelidir. orders/order_items/subscribers için INSERT politikası
-- görünmemelidir.
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
