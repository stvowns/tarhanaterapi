# Güvenlik Denetimi — 22 Ekim 2026

## Bu turda düzeltilenler

- Sipariş durum e-postası yalnızca durum gerçekten `Kargoya Verildi` olurken gönderiliyor.
  Aynı duruma tekrar basıldığında mükerrer e-posta gitmiyor. Telegram üzerinden yapılan
  `Kargoya Verildi` geçişi de aynı e-postayı gönderiyor.
- Bülten e-posta önizlemesindeki `0850 302 82 74` numarası kaldırıldı.
- “Abonelikten çık” bağlantısı mailto'dan gerçek tek tıkla çıkışa çevrildi:
  `GET/POST /api/unsubscribe?token=...`, HMAC imzalı e-posta tokenı, Resend kontaktını
  `unsubscribed: true` yapar, Supabase kaydına `unsubscribed_at` yazmayı dener.
  `List-Unsubscribe` ve `List-Unsubscribe-Post` başlıkları eklendi.
- E-kitap PDF'inin ilk sayfa alt bilgisinden satış e-postası kaldırıldı; son sayfa adresi
  `Muradiye Mh., Orhangazi / Bursa` olarak yeniden üretildi.
- Demo müşteri girişi kaldırıldı; admin kontrolleri yalnızca Supabase oturumu + onaylı e-posta
  ile çalışıyor.
- `create-order` tarafında ürün adedi, sepet boyutu, metin uzunlukları ve e-posta doğrulaması
  sıkılaştırıldı. Kapıda ödeme varsayılan olarak kapalı; yalnızca `ALLOW_COD=true` ise kabul edilir.
- Telegram webhook artık `TELEGRAM_WEBHOOK_SECRET` ve `TELEGRAM_ADMIN_CHAT_ID` yoksa istek
  kabul etmiyor; sipariş ID'leri UUID ve durumlar izinli liste ile doğrulanıyor.
- Güvenlik başlıklarına `frame-ancestors`, `form-action`, `upgrade-insecure-requests`,
  `X-Permitted-Cross-Domain-Policies` ve `Cross-Origin-Opener-Policy` eklendi.

## Uygulanan ek kontroller (22 Ekim 2026)

- **Cloudflare WAF rate limiting:** `API POST abuse protection` kuralı oluşturuldu.
  Eşleşme `(http.request.method eq "POST" and starts_with(http.request.uri.path, "/api/"))`;
  IP başına **5 istek / 10 saniye**, aşınca **Block / 10 saniye**, durum **Active**.
  Kural ID: `e68c5aebf5f24b0d93457338ba12893c`. Free plan tek kural ve 10 saniyelik
  period/duration ile sınırlıdır; GET ve statik trafik etkilenmez.
- **Telegram webhook secret rotasyonu:** `./rotate-telegram-webhook.sh` ile yeni secret
  üretildi, Cloudflare'a yazıldı ve webhook güncellendi. Bot canlıda yanıt veriyor.
- **Resend API key rotasyonu:** `tarhanaterapi-prod-2026-10-22` (Full access) oluşturuldu;
  Cloudflare `RESEND_API_KEY` güncellendi. Test iletişim formu `200` döndü ve test maili
  teslim edildi. Resend panelinde 1/1 anahtar var; eski anahtar listede yok.
- **`admin@tarhanaterapi.com` kaldırıldı:** canlı API allowlist'leri, eski Netlify
  fonksiyonları, frontend admin kontrolleri, UI footer'ı ve dokümanlar temizlendi.
- **MFA altyapısı:** Supabase TOTP challenge ve Admin → Güvenlik enrollment eklendi.
  7 yönetici API'sinde `tokenAal` + `ADMIN_MFA_REQUIRED` kontrolü var. `./set-admin-mfa.sh`
  ile enforcement açılıp kapatılabiliyor. Şu an enrollment yapılmadığı için
  `ADMIN_MFA_REQUIRED` kapalı.
- **Profil sipariş geçmişi:** ürün görseli/adı/gramajı/adet/birim fiyat/satır toplamı,
  ara toplam/kargo/indirim/toplam, teslimat notu ve tarih+saat gösteriliyor.
- **`/urunler`:** listeleme sayfası kaldırıldı; `/urunler` → `/urunler/tarhana-classic`
  **301**. Sitemap, `llms.txt`, iç linkler, prerender ve redirect kuralları güncellendi.

## Supabase RLS sertleştirmesi — uygulandı (22 Ekim 2026)

`supabase/security-hardening.sql` Supabase SQL Editor içinde çalıştırıldı. Bu dosya:

- `orders`, `order_items`, `subscribers` üzerindeki tüm `INSERT` politikalarını kaldırdı.
  Bu politikalar açıkken public anon anahtarıyla API atlanarak sahte sipariş/abone eklenebiliyordu.
- `reviews` tablosunda yalnızca `verified = true` kayıtların public okunmasına izin veriyor.
  Önceden onay bekleyen yorumlar da anon anahtarla okunabiliyordu.
- `subscribers.unsubscribed_at` kolonunu ve `orders(customer_email)` indeksini ekledi.

Doğrulama (public publishable anahtarıyla):

- `orders`, `order_items`, `subscribers`, `reviews` INSERT denemeleri artık `42501`
  “new row violates row-level security policy” döndürüyor.
- `orders` ve `subscribers` SELECT denemeleri boş liste döndürüyor; public erişim yok.
- Onaylı yorum uç noktası çalışıyor; onay bekleyenler uç noktası yetkisiz `401` veriyor.

## Kalan operasyonel aksiyonlar

1. Supabase Auth → Email sağlayıcısında **Confirm email**ı açın; Site URL ve redirect
   URL'lerini `https://tarhanaterapi.com` olarak ayarlayın. Admin hesabında TOTP enrollment
   yapın, ardından `./set-admin-mfa.sh on` çalıştırıp deploy edin. Uzun vadede admin yetkisini
   `app_metadata.role = 'admin'` ile verin.
2. Gerçek banka/IBAN bilgilerini, Shopier onayını ve kargo teklifini netleştirin.
3. Cloudflare Web Analytics ve Yandex Webmaster doğrulamasını tamamlayın.
4. İsteğe bağlı: Turnstile ve bülten double opt-in ekleyin. Mevcut edge rate limit
   `POST /api/*` için 5 istek/10 sn; Free plan nedeniyle daha uzun pencere yok.

## Kalan riskler

- Admin yetkisi artık Supabase `app_metadata.role = 'admin'` ile rol tabanlı; e-posta allowlist'i kaldırıldı. MFA henüz zorunlu değil.
- Public formlarda CAPTCHA/Turnstile yok. Edge rate limit `POST /api/*` için 5 istek/10 sn,
  ancak Free plan nedeniyle yalnızca 10 saniyelik pencere ve tek kural var.
- MFA altyapısı hazır olsa da `ADMIN_MFA_REQUIRED` kapalı ve Supabase Confirm email kapalı; kullanıcı MFA kurulumunu şimdilik erteledi. Admin paneli bu süre boyunca Google/şifre oturumu + rol kontrolüyle korunuyor.
- Bülten aboneliğinde double opt-in yok; biri başkasının e-postasını formdan ekleyebilir.
- CSP'de `script-src 'unsafe-inline'` kaldırıldı; `style-src 'unsafe-inline'` React inline
  stilleri ve statik kabuk nedeniyle duruyor.
- `netlify/functions`, `netlify.toml` ve `vercel.json` kaldırıldı; canlı API yalnızca `functions/api/*` altında.
- `npm audit` (prod + dev) temiz; bilinen bağımlılık açığı yok.

## İlgili dokümanlar

- `docs/progress-and-security.md` — güncel durum ve doğrulama sonuçları
- `docs/deployment-and-data.md` — Cloudflare/Supabase mimarisi ve env listesi
- `docs/email-ve-yayin-mimarisi.md` — sipariş e-postası, bülten ve unsubscribe akışı
- `docs/yapilacaklar-listesi.md` — açık operasyonel işler
