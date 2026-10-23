# TarhanaTerapi — Canlı Ortam, Veri ve Bildirim Mimarisi

**Son güncelleme:** 22 Ekim 2026

## 1. Canlı ortam

| Bileşen | Güncel durum |
|---|---|
| Hosting | **Cloudflare Pages** — proje adı `tarhanaterapi` |
| Alan adı | `https://tarhanaterapi.com`; `www` → apex 301 |
| API | Cloudflare Pages Functions (`functions/api/*`) |
| Veritabanı | Supabase Postgres, proje ref `atrvalwnvruzsbpkgfrl` |
| Otomatik e-posta | Resend (`satis@tarhanaterapi.com`, domain verified) |
| Yönetici bildirimi | Telegram Bot API (`/api/telegram-webhook`) |
| Gelen e-posta | Northwest Business Identity (`satis@tarhanaterapi.com`) |
| DNS / SSL / CDN | Cloudflare (Universal SSL, HSTS) |

- Eski Netlify sitesi silindi; `tarhanaterapi.netlify.app` artık 404 döner.
- Repodaki eski `netlify/`, `netlify.toml` ve `vercel.json` dosyaları kaldırıldı; canlıda yalnızca Cloudflare Pages kullanılır.
- Cloudflare Pages projesinde Git Provider **bağlıdır**; `git push` otomatik build/deploy tetikler. Manuel `wrangler pages deploy` da kullanılabilir.

### Cloudflare WAF rate limiting

- Kural adı: **`API POST abuse protection`**; durum **Active**.
- Kural ID: `e68c5aebf5f24b0d93457338ba12893c`.
- Eşleşme: `(http.request.method eq "POST" and starts_with(http.request.uri.path, "/api/"))`
- Limit: **IP başına 5 istek / 10 saniye**; aşınca **Block**, **10 saniye** süreyle.
- Yalnızca `/api/*` POST trafiğini etkiler; GET istekleri ve statik sayfalar etkilenmez.
- Cloudflare Free planında **1 rate limiting kuralı** ve yalnızca **10 saniyelik** period/duration destekleniyor.
- Kural, Wrangler token'ında WAF yazma yetkisi olmadığı için dashboard → Security → Security rules → Rate limiting rules üzerinden oluşturuldu.

## 2. Build ve deploy

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name tarhanaterapi \
  --branch main \
  --commit-hash <40-karakterlik-commit-sha>
```

- `npm run build`: Vite + `scripts/prerender.ts` → `dist/`.
- `wrangler pages deploy dist`: statik çıktı + `functions/` paketini yükler.
- `--commit-hash` tam 40 karakter olmalı; kısa SHA kullanılmamalı.
- Build mutlaka **gerçek `VITE_*` değerleriyle** alınmalı. Dummy Supabase değerleriyle üretilmiş `dist/` asla deploy edilmemeli.
- Deploy sonrası test özel alan adından yapılmalı; `*.pages.dev` Türkiye'de engelli olabilir.
- Git entegrasyonu açık olduğu için push otomatik build/deploy tetikler. Yalnızca doküman değişikliği canlı siteyi etkilemez; yine de otomatik build çalışabilir.

Son doğrulanan prod code commit: `1176edcba0f5170de26fbb17ba14a20aa30972be`.

## 3. Frontend build değişkenleri

| Değişken | Açıklama |
|---|---|
| `VITE_SITE_URL` | `https://tarhanaterapi.com` |
| `VITE_SUPABASE_URL` | `https://atrvalwnvruzsbpkgfrl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key (public) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_BANK_TRANSFER_BANK` | Banka adı (yalnızca gerçek değer) |
| `VITE_BANK_TRANSFER_ACCOUNT_NAME` | Hesap sahibi (yalnızca gerçek değer) |
| `VITE_BANK_TRANSFER_IBAN` | IBAN (yalnızca gerçek değer) |

## 4. Sunucu tarafı secret'lar (Cloudflare Pages)

| Değişken | Kullanım |
|---|---|
| `SUPABASE_URL` | Supabase REST erişimi |
| `SUPABASE_ANON_KEY` | Auth token doğrulama (frontend anahtarı da kullanılabilir) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnızca Functions; RLS bypass eden yazma/okuma |
| `RESEND_API_KEY` | Sipariş, iletişim ve bülten e-postaları |
| `RESEND_AUDIENCE_ID` | Bülten kontakt segmenti |
| `NEWSLETTER_FROM_EMAIL` | Bülten gönderen adresi |
| `NEWSLETTER_REPLY_TO` | Bülten yanıt adresi |
| `UNSUBSCRIBE_SECRET` | Abonelikten çıkma HMAC imzası |
| `TELEGRAM_BOT_TOKEN` | Bot API |
| `TELEGRAM_ADMIN_CHAT_ID` | Yönetici sohbeti |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook doğrulama; yoksa webhook fail-closed |
| `ALLOW_COD` | `true` değilse Kapıda Ödeme kabul edilmez |
| `ADMIN_MFA_REQUIRED` | `true` ise yönetici API'leri `aal2` MFA oturumu ister; varsayılan kapalı. `on` yazmak enforcement'ı açmaz. |
| `BANK_TRANSFER_BANK`, `BANK_TRANSFER_ACCOUNT_NAME`, `BANK_TRANSFER_IBAN` | Havale/EFT bilgileri (yalnızca gerçek değer) |

> `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` ve `UNSUBSCRIBE_SECRET` frontend'e sızmamalı; repoya yazılmamalı.

## 5. Veri modeli

Supabase şeması `supabase/schema.sql` içinde; güvenlik sertleştirmesi `supabase/security-hardening.sql` ile uygulandı.

Tablolar:

- `products`
- `customers`
- `orders`
- `order_items`
- `subscribers`
- `reviews`
- `faq`

### RLS / erişim kuralları (22 Ekim 2026)

- `orders`, `order_items`, `subscribers` ve `reviews` üzerinde **anon INSERT politikası yok**.
- Public `reviews` okuması yalnızca `verified = true` kayıtlarla sınırlı.
- Public `orders` / `subscribers` SELECT denemeleri boş döner.
- Sipariş oluşturma, durum güncelleme, abone ekleme ve yorum gönderme yalnızca server-side Functions üzerinden `service_role` ile yapılır.
- Yönetici uçları ayrıca Supabase ile **doğrulanmış e-posta** ve `app_metadata.role = 'admin'` kontrolü yapar.
- Public anahtarla geçersiz INSERT denemesi `42501` (HTTP `401`) alır.

Migration yeniden çalıştırılmamalı; yalnızca politikaların açık olduğu tespit edilirse `supabase/security-hardening.sql` uygulanır.

## 6. Sipariş akışı

1. Checkout → `POST /api/create-order`
2. Function doğrulamaları:
   - Zorunlu alanlar + KVKK onayı
   - E-posta / telefon / adres format ve uzunluk kontrolü
   - Ürün adedi ve toplam tutar üst sınırı
   - Fiyatların sunucuda yeniden hesaplanması
   - Kargo: 2000 TL üzeri ücretsiz, altı 150 TL
   - Ödeme yöntemi: varsayılan `bank_transfer`; `cod` yalnızca `ALLOW_COD=true` ise
3. Supabase `orders` + `order_items` yazımı (`service_role`)
4. Paralel bildirimler:
   - Telegram → yönetici sohbeti
   - Resend → müşteriye sipariş onay e-postası
5. Durum güncellemesi → `POST /api/update-order-status`
   - Müşteriye e-posta **yalnızca** durum ilk kez `Kargoya Verildi` olduğunda gider.
   - Aynı durumun tekrarı veya diğer durumlar mail göndermez.

Sipariş numarası sıralı `TT-XXXXXX` formatındadır.

## 7. Bülten ve abonelikten çıkma

- Abone kaydı: `POST /api/subscribe` → Supabase `subscribers` + Resend contacts.
- Gönderim: yönetici paneli → `POST /api/send-newsletter`.
- Her alıcıya özel HMAC token'lı `GET/POST /api/unsubscribe?token=...` bağlantısı eklenir.
- `List-Unsubscribe` / `List-Unsubscribe-Post` başlıkları e-posta istemcisinin tek tıkla çıkma özelliğini destekler.
- Geçerli token `200` + `unsubscribed_at`; geçersiz token `400`.

## 8. Doğrulama kontrol listesi

Deploy sonrası en az şunlar kontrol edilmeli:

- [ ] Ana sayfa `200`
- [ ] `/kadim-corba-rituelleri-ve-sifali-tarifler.pdf` `200`
- [ ] `/api/my-orders` (geçici kapalı) `410`
- [ ] `/api/update-order-status` yetkisiz `401`
- [ ] Geçersiz `/api/unsubscribe` `400`
- [ ] Secret'sız `/api/telegram-webhook` `401`
- [ ] Geçersiz `create-order` / `subscribe` `400`
- [ ] `/urunler` `301` → `/urunler/tarhana-classic`
- [ ] `/urunler/tarhana-classic` `200`
- [ ] İletişim formu testi `200`; Resend e-postası teslim edildi
- [ ] Cloudflare rate limit kuralı `1/1` ve **Active**
- [ ] Public `orders` / `subscribers` SELECT boş
- [ ] Public geçersiz INSERT `42501` / HTTP `401`

## 9. Açık operasyon işleri

22 Ekim 2026 itibarıyla Telegram/Resend secret rotasyonları ve Cloudflare WAF rate limit tamamlandı. Kalanlar:

- Supabase Auth “Confirm email”ı aç; admin hesabında TOTP enrollment yap; sonra `./set-admin-mfa.sh on` ve deploy.
- Gerçek banka/IBAN bilgilerini, Shopier onayını ve kargo teklifini netleştir.
- Cloudflare Web Analytics ve Yandex Webmaster doğrulamasını tamamla.
- İsteğe bağlı: Turnstile ve bülten double opt-in ekle.
