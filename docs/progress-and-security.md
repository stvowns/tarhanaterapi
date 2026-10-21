# TarhanaTerapi — Güncel Durum, Güvenlik ve Operasyon (2026-10-21)

## Özet
- Repo: https://github.com/stvowns/tarhanaterapi.git, branch `main`
- İlk çalışan site: https://tarhanaterapi.netlify.app
- DB: Supabase ref `atrvalwnvruzsbpkgfrl`; sipariş tek kaynağı `public.orders`
- Ödeme şu an yalnızca Havale/EFT; Kapıda Ödeme kartı görünür ama “Yakında!” etiketiyle devre dışı
- Frontend payment provider henüz net olmadığı için credit-card akışı kapatılmıştır

## Yapılanlar
- SEO/GEO baseline (robots.txt, sitemap.xml, llms.txt, route-level SeoHead)
- React Router + canonical/meta
- Supabase Auth/DB + Netlify Functions gateway
- DB-only checkout, localStorage demo sipariş akışı kaldırıldı
- sipariş fiyat doğrulaması server-side (`PRODUCT_PRICES`)
- admin panel DB siparişleri Realtime ile çekiyor
- Telegram aktif sipariş/özet ve durum butonu
- KVKK rıza checkbox — frontend + backend zorunlu
- Admin order error mesajları generic (`Sipariş alınamadı` vb.)
- CSV formula injection sanitize (`safeCsv`)
- Contact form → Telegram + Resend email dispatch
- Contact form rate-limited (5/dk/IP)
- Security headers `netlify.toml` ile etkin
- dead code (hardcoded parola, kart form/state) temizlendi
- VITE_* env fallback'ları kaldırıldı, fail-fast

## Kritik Güvenlik / Test Sonuçları
- `GET /.netlify/functions/list-orders` (token'sız) → 401
- `GET /.netlify/functions/list-orders` admin JWT ile → 200
- `POST /.netlify/functions/update-order-status` (token'sız) → 401
- Sunucu formda client total yoksayılıyor ve yeniden hesplanıyor
- Check: no repo `.env`, no frontend service role/secrets
- `vite build` + `tsc --noEmit` PASS

## Bilinen Sınırlamalar (non-kritik)
- Rate limit in-memory instance bazlı; Supabase/Upstash ile kalıcı yapılabilir
- `isAdmin` frontend'de e-posta string ve `app_metadata` server-side koruma ile birleşiyor — temel güvenli; e-postalar ilerde `app_metadata`'ya taşınacak
- KVKK Aydınlatma link/policy sayfası eklenmedi; sadece checkbox
- Payment gateway akışı açık değil (kart opsiyonu preview)
- Resend email seçeneği env olmadan devre dışı
- Vercel taşıma değerlendirildi; şimdilik geçilmedi.

## Operasyon / Env Checklist
- `VITE_SITE_URL`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`
- (Optional) `RESEND_API_KEY`
- Telegram webhook URL: `https://tarhanaterapi.netlify.app/.netlify/functions/telegram-webhook`
- Secret: `tarhana-secret-2026`

## Yerel Çalıştırma
- `npm install --legacy-peer-deps`
- `npm run dev` (Vite) + `netlify dev --port 8888`
- Ziyaret: http://localhost:8888

## Deploy Durumu
- Latest code localde commit edildi (main)
- Drag-and-drop/test için draft deploy her iki kabul aldı
- Production deploy (`netlify deploy --prod`) 403 Limit sebebiyle blokelyy
- Draft URL'ler:
  - `https://6acd358101d16887aaeb1df4--tarhanaterapi.netlify.app`
  - `https://6acd36c4e79443755886f9bd--tarhanaterapi.netlify.app`
- Production'a geçiş için Netlify UI'dan `Publish deploy` kullanılabilir veya plan limit çözülince `netlify deploy --prod`

## pending / next
- Contact form Telegram notification test (real admin chat)
- Telegram bot `/orders` ve status callback test aktif
- CSV/CSV-export admin test
- Payment provider provider entegrasyonu belirlenince kart seçeneği açılacak
- Admin email allowlist -> Supabase app_metadata migration

## Notes
- Doküman sürekli kronolojik devam; yeni eklenti en altta eklenmeli.