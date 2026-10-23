-- TarhanaTerapi — sipariş RLS sahipliğini e-posta yerine auth kullanıcısına bağla
--
-- Eski politika `customer_email = auth.jwt()->>'email'` kullanıyordu. Otomatik
-- onay açıkken bu, e-postayı bilen/oturum açan birinin o e-postaya ait tüm
-- siparişleri doğrudan Supabase REST üzerinden okumasına izin veriyordu.
-- Yeni politika yalnızca `auth_user_id = auth.uid()` eşleşmesini kabul eder.

drop policy if exists "users can read own orders" on public.orders;

create policy "users can read own orders"
  on public.orders
  for select
  to authenticated
  using (auth_user_id = auth.uid());

-- Yazma yalnızca service_role taşıyan Cloudflare Functions üzerinden yapılır.
revoke insert, update, delete on public.orders from anon, authenticated;
