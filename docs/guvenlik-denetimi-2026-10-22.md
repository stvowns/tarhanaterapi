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

## Acil operasyonel aksiyonlar

1. **Telegram webhook secret'ını rotate edin.** Eski `tarhana-secret-2026` değeri repo
   dokümanında açık metin olarak duruyordu; dokümandan kaldırıldı ancak git geçmişinde vardır.
   Bot API `setWebhook` çağrısında yeni `secret_token` belirleyin ve Cloudflare'de
   `TELEGRAM_WEBHOOK_SECRET` değerini güncelleyin.
2. **Resend API anahtarını rotate edin.** Anahtar daha önce paylaşıldıysa yeni anahtar oluşturun.
3. Supabase Auth → Email sağlayıcısında **Confirm email** açık olsun. Admin hesaplarında MFA
   etkinleştirin. Uzun vadede admin yetkisini `app_metadata.role = 'admin'` ile verin.
4. Cloudflare'de `/api/create-order`, `/api/contact-message`, `/api/submit-review`,
   `/api/subscribe` için kalıcı rate limiting (veya Turnstile) tanımlayın. Koddaki limitler
   yalnızca tek bir Function instance'ı içinde tutulduğu için dağıtık spam'i tam durdurmaz.

## Kalan riskler

- Admin yetkisi hâlâ e-posta allowlist'ine bağlı; e-posta hesabı ele geçirilirse admin paneline
  erişilebilir. MFA ve `app_metadata` geçişi önerilir.
- Public formlarda CAPTCHA/Turnstile yok; in-memory rate limit aşılabiliyor.
- Bülten aboneliğinde double opt-in yok; biri başkasının e-postasını formdan ekleyebilir.
- CSP'de `script-src 'unsafe-inline'` var; JSON-LD ve mevcut yapı nedeniyle korunuyor.
- `netlify/functions` altındaki eski fonksiyonlar artık kullanılmıyor; ileride silinmeli.
- `npm audit` (prod + dev) temiz; bilinen bağımlılık açığı yok.

## İlgili dokümanlar

- `docs/progress-and-security.md` — güncel durum ve doğrulama sonuçları
- `docs/deployment-and-data.md` — Cloudflare/Supabase mimarisi ve env listesi
- `docs/email-ve-yayin-mimarisi.md` — sipariş e-postası, bülten ve unsubscribe akışı
- `docs/yapilacaklar-listesi.md` — açık operasyonel işler
