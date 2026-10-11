# TarhanaTerapi — ücretsiz canlıya geçiş, DB ve bildirim planı

## 1) Ücretsiz dağıtım (önerilen: Vercel Hobby)
1. GitHub repo'yu Vercel'e import et.
2. Framework: Vite; build command `npm run build`; output `dist`.
3. Deep link için `vercel.json` rewrites zaten repo'da.
4. Frontend ücretsiz: Vercel Hobby (100GB/ay bant genişliği) yeterli.
5. Resimler için Cloudinary ücretsiz tier veya Supabase Storage; Google remote asset'leri kendi depoya taşı.
6. Domain: ücretsiz Vercel subdomain (`*.vercel.app`) ile başla; kendi alan adı sonra.

Netlify alternatifi: repo'yu import et, build `npm run build`, publish `dist`; `public/_redirects` zaten eklendi.

## 2) DB seçimi (ücretsiz + RLS)
Öneri: Supabase Free Postgres (500MB, RLS, Auth, Realtime, Storage).
Alternatif: Neon (0.5GB) + ayrı auth.

RLS kuralı: müşteri kendi siparişini görür, admin her şeyi görür.

## 3) Önerilen şema
`supabase/schema.sql` dosyasına taşındı. Tablolar:
- products
- customers
- orders
- order_items
- subscribers
- reviews
- faq

## 4) Ödeme / bildirim akışı
- Checkout submit → `/api/orders` serverless.
- DB'ye sipariş + kalem yazılır.
- Bildirimler:
  - E-posta: Resend ücretsiz tier (3k/ay) ile müşteriye onay + admin'e alert.
  - Telegram bot: env `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID`; sipariş özetini ücretsiz webhook.
  - İsteğe bağlı WhatsApp Business API (ücretli, 2. faz).
- Admin panel: Supabase Realtime subscription ile yeni sipariş anlık düşer; tarayıcı notification chime mevcut.

## 5) Gizli anahtarlar (Vercel env)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (sadece serverless)
- `RESEND_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`
- `VITE_SITE_URL=https://tarhanaterapi.com`

## 6) Migrasyon sırası (ücretsiz)
1. Sadece frontend'i Vercel'e deploy et (mevcut localStorage akışı).
2. Supabase schema + seed products.
3. `/api/orders` ve `/api/subscribers` ekle.
4. Form'ları API'ye bağla.
5. E-posta/Telegram bildirimi ekle.
6. Ödeme sağlayıcı (iyzico/Stripe) sandbox, sonra canlı.
7. Sitemap'i DB/products'tan üret.

## 7) Dikkat
- localStorage şu an demo; canlı satışta tek kaynak DB olmalı.
- Sahte yorum/FTC riski: aggregateRating sadece gerçek yorumlar için.
- `revalidate`/cron ile stok ve fiyat gündelik senkronize edilmeli.
