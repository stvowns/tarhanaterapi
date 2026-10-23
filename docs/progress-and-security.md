# TarhanaTerapi — Güncel Durum, Güvenlik ve Operasyon (2026-10-22)

## Özet

- Repo: `https://github.com/stvowns/tarhanaterapi`, branch `main`
- Canlı site: **https://tarhanaterapi.com** (Cloudflare Pages; `www` → apex 301)
- DB: Supabase ref `atrvalwnvruzsbpkgfrl`; sipariş tek kaynağı `public.orders`
- Ödeme: yalnızca **Havale/EFT**. Kapıda Ödeme yalnızca `ALLOW_COD=true` ise kabul edilir; varsayılan kapalı.
- Sipariş numarası: sıralı `TT-XXXXXX`.
- Adres: **Muradiye Mh., Orhangazi / Bursa**
- Prod code commit: `1176edcba0f5170de26fbb17ba14a20aa30972be`
- Son manuel Cloudflare deployment: `7bacb531`
- Docs: 22 Ekim 2026 operasyon notları güncel.

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
- Yönetici yetkisi Supabase `app_metadata.role = 'admin'` ile rol tabanlı.
- `create-order`: zorunlu alan, e-posta/telefon/adres uzunluğu, ürün adedi ve toplam tutar üst sınırı doğrulanıyor; fiyatlar sunucuda yeniden hesaplanıyor.
- Kapıda Ödeme varsayılan olarak kapalı; yalnızca `ALLOW_COD=true` ile açılabiliyor.
- Telegram webhook **fail-closed**: `TELEGRAM_WEBHOOK_SECRET` yoksa veya gelen secret eşleşmiyorsa `401`; admin chat ID kontrolü de yapılıyor.
- Public demo login kaldırıldı.
- `public/_headers` içinde CSP, HSTS ve diğer güvenlik başlıkları güncellendi.
- `admin@tarhanaterapi.com` tüm canlı API allowlist'lerinden, eski Netlify fonksiyonlarından, frontend admin kontrollerinden, UI footer'ından ve dokümanlardan kaldırıldı.

### Cloudflare WAF rate limiting

- 22 Ekim 2026'da Cloudflare dashboard → **Security → Security rules → Rate limiting rules** üzerinden **`API POST abuse protection`** kuralı oluşturuldu.
- Kural ID: `e68c5aebf5f24b0d93457338ba12893c`; durum **Active**.
- Eşleşme: `(http.request.method eq "POST" and starts_with(http.request.uri.path, "/api/"))`
- Limit: **IP başına 5 istek / 10 saniye**; aşınca **Block**, **10 saniye** süreyle.
- GET istekleri, statik sayfalar, ürün görselleri ve normal sayfa trafiği etkilenmez; yalnızca `/api/*` altındaki POST trafiği korunur.
- Free plan sınırı: **1 kural** ve yalnızca **10 saniyelik** period/duration. Daha esnek limit gerekirse plan yükseltmesi veya Turnstile değerlendirilmeli.
- Wrangler OAuth token'ında WAF/ruleset yazma yetkisi olmadığı için kural dashboard üzerinden oluşturuldu; token'a ek yetki verilmedi.
- Not: Aynı IP'den 10 saniyede 5'ten fazla admin POST'u (örn. çok hızlı sipariş durum güncellemesi) bloklanabilir. Normal kullanımda bu sınıra ulaşılmıyor; gerekirse eşik artırılmalı veya admin yolları istisna tutulmalı.

### Resend anahtar rotasyonu

- Yeni anahtar: **`tarhanaterapi-prod-2026-10-22`** (Full access), 22 Ekim 2026'da oluşturuldu.
- Cloudflare Pages `RESEND_API_KEY` bu anahtarla güncellendi; deploy sonrası iletişim formu testi HTTP `200` döndü ve test e-postası teslim edildi.
- Resend API Keys ekranında **1/1 anahtar** görünüyor; eski anahtar listede yok. Dolayısıyla ayrıca iptal edilecek aktif eski anahtar kalmadı.
- Anahtar değeri repoya veya frontend'e yazılmadı.

### Telegram webhook secret

- `./rotate-telegram-webhook.sh` ile yeni secret üretildi, Cloudflare'a yazıldı ve webhook aynı secret ile güncellendi.
- Bot yanıt veriyor; canlı testte sipariş bildirimi alındı.
- Eski `tarhana-secret-2026` artık kullanılmıyor.

### Profil sipariş geçmişi

- `src/components/UserProfileModal.tsx` sipariş kartında ürün görseli, adı, gramajı, adedi, birim fiyatı, satır toplamı, ara toplam, kargo, indirim, genel toplam, teslimat notu ve **tarih + saat** gösteriyor.
- Canlıda `TT-48214` test siparişinde doğrulandı.

### MFA

- Supabase TOTP tabanlı MFA istemci tarafında tamamlandı: girişte TOTP challenge, Admin → **Güvenlik** sekmesinde enrollment.
- 7 yönetici API'sinde `tokenAal` ve `ADMIN_MFA_REQUIRED` kontrolü var; `ADMIN_MFA_REQUIRED=on` iken `aal2` olmayan oturumlar reddediliyor.
- `./set-admin-mfa.sh on|off` ile enforcement açılıp kapatılıyor.
- Şu an `ADMIN_MFA_REQUIRED` ayarlı değil; Supabase'de Confirm email kapalı (`mailer_autoconfirm: true`) ve admin hesabında TOTP faktörü yok. Kullanıcı enrollment'ı erteledi; sırasıyla Supabase Confirm email/TOTP/URL ayarları, Admin → Güvenlik enrollment, `./set-admin-mfa.sh on`, deploy yapılmalı.

### `/urunler` listeleme sayfası

- Ayrı ürün listeleme sayfası (`ProductsPage`) kaldırıldı.
- `/urunler` kalıcı olarak **301 → `/urunler/tarhana-classic`**; Header, Footer, Story CTA, ürün breadcrumb'ı, sitemap, `llms.txt`, `404.html`, `index.html`, prerender ve Netlify/Cloudflare redirect kuralları güncellendi.
- Canlı doğrulama: `/urunler` `301`, `Location: /urunler/tarhana-classic`; tarayıcı ürün sayfasına düşüyor; sitemap'te tam `/urunler` yok; IndexNow 13 URL için `200`.

## Canlı doğrulama sonuçları

| Kontrol | Sonuç |
|---|---|
| Ana sayfa | `200` |
| E-kitap PDF | `200` |
| `/api/my-orders` yetkisiz | `401` |
| `/api/update-order-status` yetkisiz | `401` |
| Geçersiz `/api/unsubscribe` | `400` |
| `/urunler` | `301` → `/urunler/tarhana-classic` |
| `/urunler/tarhana-classic` | `200` |
| İletişim formu (Resend testi) | `200`, e-posta teslim edildi |
| Cloudflare rate limit rule | `1/1` Active |
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
- Cloudflare Pages projesinde Git Provider bağlıdır; `git push` otomatik build/deploy tetikler. Manuel `wrangler pages deploy` da kullanılabilir.
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
- `ADMIN_MFA_REQUIRED=on` (MFA zorunluluğu; varsayılan kapalı)
- `BANK_TRANSFER_BANK`, `BANK_TRANSFER_ACCOUNT_NAME`, `BANK_TRANSFER_IBAN` (yalnızca gerçek değerler)

> `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN` ve `UNSUBSCRIBE_SECRET` asla frontend'e veya repoya yazılmamalı.

## Bilinen sınırlamalar / açık işler

- **Supabase Auth / MFA:** Confirm email şu an kapalı (`mailer_autoconfirm: true`); admin hesabında TOTP faktörü yok. Kullanıcı MFA kurulumunu 23 Ekim 2026'da şimdilik erteledi; `ADMIN_MFA_REQUIRED` kapalı. Kurulum yapılırsa `./set-admin-mfa.sh on` ile enforcement açılmalı.
- **Rate limit kapsamı:** Cloudflare Free planında tek kural ve yalnızca 10 saniyelik period/duration var. Daha ayrıntılı limit veya CAPTCHA gerekiyorsa Turnstile/üst plan değerlendirilmeli.
- **Bülten:** Double opt-in yok; biri başkasının e-postasını formdan ekleyebilir.
- Yönetici yetkisi Supabase `app_metadata.role = 'admin'` ile yönetiliyor; e-posta allowlist'i kaldırıldı.
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
