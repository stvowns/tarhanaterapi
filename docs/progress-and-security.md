# TarhanaTerapi — Güncel Durum, Güvenlik ve Operasyon (2026-10-22)

## Özet

- Repo: `https://github.com/stvowns/tarhanaterapi`, branch `main`
- Canlı site: **https://tarhanaterapi.com** (Cloudflare Pages; `www` → apex 301)
- DB: Supabase ref `atrvalwnvruzsbpkgfrl`; sipariş tek kaynağı `public.orders`
- Ödeme: yalnızca **Havale/EFT**. Kapıda Ödeme yalnızca `ALLOW_COD=true` ise kabul edilir; varsayılan kapalı.
- Sipariş numarası: sıralı `TT-XXXXXX`.
- Adres: **Muradiye Mh., Orhangazi / Bursa**
- Prod code commit: `0b423805cf81f4ee136757ef8fd0d89f8f534350`
- Docs commit: `bd88d18` (`Record Supabase RLS verification`)

## 22 Ekim 2026 tamamlananlar

### Sipariş e-postası

- `functions/api/update-order-status.js` artık siparişin **mevcut durumunu önce okuyor**.
- Müşteriye e-posta **yalnızca durum `Kargoya Verildi` olduğunda ve bu geçiş ilk kez yapıldığında** gidiyor.
- Aynı durumun tekrar kaydedilmesi, diğer durum değişiklikleri ve durum dışı alan güncellemeleri e-posta göndermiyor.
- `functions/api/telegram-webhook.js` aynı davranışı uyguluyor; Telegram üzerinden verilen “Kargoya Verildi” komutu da yalnızca geçiş anında mail atıyor.
- Böylece panelden veya Telegram'dan yapılan tekrar işlemlerde mükerrer kargo e-postası engellendi.

### Bülten ve e-kitap

- `src/lib/newsletterTemplate.ts`: yönetici bülten önizlemesi ve e-posta alt bilgisinden **0850 302 82 74** kaldırıldı.
- Abonelikten çıkma artık gerçekten çalışıyor:
  - `GET/POST /api/unsubscribe?token=...` HMAC imzalı token doğruluyor.
  - Geçerli token → `200`, geçersiz/eksik token → `400`.
  - Supabase `subscribers` kaydına `unsubscribed_at` yazılıyor ve Resend kontaktı güncelleniyor.
  - Bülten gönderiminde her alıcıya kendi token'lı bağlantısı ve `List-Unsubscribe` / `List-Unsubscribe-Post` başlıkları ekleniyor.
- E-kitap PDF kaynağı (`scripts/generate-ebook.ts`) düzeltildi ve `npm run ebook` ile yeniden üretildi:
  - İlk sayfa alt bilgisinden `satis@tarhanaterapi.com` kaldırıldı.
  - Son sayfadaki eski `Gedelek Köyü Mevkii No: 28` adresi **Muradiye Mh., Orhangazi / Bursa** olarak düzeltildi.
  - Canlı PDF: `https://tarhanaterapi.com/kadim-corba-rituelleri-ve-sifali-tarifler.pdf` (200).

### Supabase / RLS

- `supabase/security-hardening.sql` uygulandı ve doğrulandı.
- `orders`, `order_items`, `subscribers` ve `reviews` tablolarındaki **anon INSERT politikaları kaldırıldı**.
- Public `reviews` okuması yalnızca `verified = true` kayıtlarla sınırlandı.
- Public `orders` / `subscribers` SELECT denemeleri boş sonuç döndürüyor.
- Public anahtarla geçersiz INSERT denemeleri artık `42501` (HTTP `401`) alıyor; önceki `23502` davranışı kapandı.
- Onay bekleyen yorumlar public uçtan `401`, onaylı yorumlar `200` dönüyor.

### API ve yönetici güvenliği

- Tüm yönetici uçları (`list-orders`, `update-order-status`, `list-subscribers`, `list-reviews`, `moderate-review`, `send-newsletter`, `list-newsletter-contacts`) Supabase ile **e-posta doğrulaması yapılmış kullanıcı** istiyor.
- Yönetici allowlist e-posta bazlı: `layeredstudio78@gmail.com`.
- `create-order`: zorunlu alan, e-posta/telefon/adres uzunluğu, ürün adedi ve toplam tutar üst sınırı doğrulanıyor; fiyatlar sunucuda yeniden hesaplanıyor.
- Kapıda Ödeme varsayılan olarak kapalı; yalnızca `ALLOW_COD=true` ile açılabiliyor.
- Telegram webhook **fail-closed**: `TELEGRAM_WEBHOOK_SECRET` yoksa veya gelen secret eşleşmiyorsa `401`; admin chat ID kontrolü de yapılıyor.
- Public demo login kaldırıldı.
- `public/_headers` içinde CSP, HSTS ve diğer güvenlik başlıkları güncellendi.

## Canlı doğrulama sonuçları

| Kontrol | Sonuç |
|---|---|
| Ana sayfa | `200` |
| E-kitap PDF | `200` |
| `/api/my-orders` yetkisiz | `401` |
| `/api/update-order-status` yetkisiz | `401` |
| Geçersiz `/api/unsubscribe` | `400` |
| Secret'sız Telegram webhook | `401` |
| Geçersiz `create-order` | `400` |
| Geçersiz `subscribe` | `400` |
| Public `orders` / `subscribers` SELECT | boş |
| Public geçersiz INSERT | `42501` / HTTP `401` |
| Onay bekleyen yorum ucu | `401` |
| Onaylı yorum ucu | `200` |

## Kalite kontrolleri

- `npm run lint` → PASS
- `node --check` (değişen Functions) → PASS
- `npm audit` → açık yok
- Production build gerçek `VITE_*` değerleriyle alındı; dummy env ile build edilmiş `dist/` **yayınlanmadı**.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name tarhanaterapi \
  --branch main \
  --commit-hash <40-karakterlik-commit-sha>
```

- `wrangler pages deploy` hem `dist/` hem `functions/` paketini yükler.
- Cloudflare Pages projesinde Git Provider bağlı değil; `git push` otomatik deploy etmez.
- `--commit-hash` için kısa SHA değil, **tam 40 karakterlik SHA** kullanılmalı.
- Deploy sonrası `*.pages.dev` yerine özel alan adı test edilmeli.

## Env / secret checklist (Cloudflare Pages)

Frontend build:

- `VITE_SITE_URL=https://tarhanaterapi.com`
- `VITE_SUPABASE_URL=https://atrvalwnvruzsbpkgfrl.supabase.co`
- `VITE_SUPABASE_ANON_KEY` (Supabase publishable/anon key)
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_BANK_TRANSFER_BANK`, `VITE_BANK_TRANSFER_ACCOUNT_NAME`, `VITE_BANK_TRANSFER_IBAN` (yalnızca gerçek değerler)

Server-side:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (veya `VITE_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (yalnızca Functions)
- `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`
- `NEWSLETTER_FROM_EMAIL`, `NEWSLETTER_REPLY_TO`
- `UNSUBSCRIBE_SECRET`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`
- `ALLOW_COD=true` (yalnızca gerçekten kapıda ödeme açılacaksa)
- `BANK_TRANSFER_BANK`, `BANK_TRANSFER_ACCOUNT_NAME`, `BANK_TRANSFER_IBAN` (yalnızca gerçek değerler)

> `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN` ve `UNSUBSCRIBE_SECRET` asla frontend'e veya repoya yazılmamalı.

## Bilinen sınırlamalar / açık işler

- **Telegram webhook secret'ı rotate edilmeli.** Eski `tarhana-secret-2026` değeri git geçmişinde duruyor.
- **Resend API key'i rotate edilmeli.** Anahtar daha önce sohbet/panel üzerinden paylaşıldı.
- Supabase Auth panelinde **“Confirm email”** açık mı ve yönetici hesaplarında MFA var mı, bir kez kontrol edilmeli.
- Public formlar için Cloudflare Turnstile veya kalıcı (DB/Upstash) rate limit henüz yok; mevcut limit in-memory ve instance bazlı.
- Yönetici allowlist koddaki e-posta listesiyle yönetiliyor; ileride Supabase `app_metadata` / rol tablosuna taşınabilir.
- Banka/IBAN bilgileri, Shopier onayı ve ödeme linki, muhasebe onayı ve kargo teklifi hâlâ kullanıcı tarafından netleştirilmeli.
- Cloudflare Web Analytics kurulumu ve Yandex Webmaster doğrulaması kullanıcı tarafında bekliyor.

## Yerel çalıştırma

```bash
npm install --legacy-peer-deps
npm run dev        # Vite
npx wrangler pages dev dist --port 8788   # Functions + statik çıktı
```

Gerçek API ve Supabase testleri için gerekli secret'lar yerel `.dev.vars` dosyasında tutulmalı; `.dev.vars` repoya eklenmemeli.

## Notlar

- Bu doküman kronolojik olarak güncellenir; yeni işler en alta eklenir.
- Ayrıntılı denetim kaydı: `docs/guvenlik-denetimi-2026-10-22.md`.
