# TarhanaTerapi — Uygulama Planı

**Tarih:** 23 Ekim 2026  
**Amaç:** Güvenlik ve KVKK açıklarını kapatmak, ardından performans/ölçüm işlerini sırayla tamamlamak.  
**Kural:** Bir madde canlıda doğrulanmadan sonrakine geçilmez.

## Sıra

### P1-A — `my-orders` sahiplik açığı (şimdi)

- [x] **Acil hotfix:** `/api/my-orders` geçici olarak `410 Gone` döndürüyor; `App.tsx` artık bu endpoint'i çağırmıyor.
  - E-posta + oturum, `mailer_autoconfirm: true` altında sahiplik kanıtı değil.
  - Sipariş durum e-postaları ve admin `list-orders` etkilenmiyor.
- [x] **Kalıcı çözüm (yeni siparişler):** Sipariş onay e-postasına rastgele, süreli erişim token'ı eklendi.
  - `orders.access_token_hash` yalnızca SHA-256 özetini saklıyor; ham token e-postada.
  - Token 180 gün geçerli; `/api/order-access?token=...` yalnızca o siparişi döndürüyor.
  - E-posta ve sipariş numarası ile arama yok.
- [x] **Test:** Token'sız/geçersiz istek `400`; bilinmeyen token `404`; geçerli token yalnızca kendi siparişini `200` döndürüyor; süresi dolmuş token `410`.
- [x] **`Cache-Control: no-store`** sipariş döndüren endpoint'lerde.
- [ ] **Eski siparişler:** 23 Ekim 2026 öncesi siparişlerde token yok; profil içi liste için ayrıca `customer_id`/oturum sahipliği veya destek üzerinden yeniden gönderim akışı gerekir.
- [ ] **Profil içi sipariş listesi:** `my-orders` yalnızca `customer_id = auth.uid()` veya magic-link doğrulaması ile yeniden açılmalı; e-posta ile arama yapılmamalı.

> **Not:** “Sipariş no + e-posta” nihai çözüm değil. Sipariş numaraları sıralı (`TT-#####`) ve endpoint'te kalıcı rate limit yok; bu ikisi birlikte sahiplik kanıtı sayılmaz.

### P1-B — KVKK açık rıza (aynı sprint)

- [x] `NewsletterSection` formuna varsayılan işaretsiz KVKK onay kutusu ve `/kvkk` linki ekle.
- [x] `EbookModal` e-posta formuna aynı onay kutusunu ekle; e-kitap gönderimi ile bülten aboneliğini ayır.
- [x] `Footer` bülten formuna aynı onay kutusunu ekle.
- [x] Onay olmadan submit'i engelle; `subscribers` tablosunda onay zamanı/sürümü/kaynağı sakla (`marketing_consent`, `consent_at`, `consent_version`, `consent_source`).
- [ ] KVKK metnini ve çerez/analitik açıklamalarını hukukçuya kontrol ettir.
- [ ] Eski aboneleri (`marketing_consent = false`) yeni bülten gönderiminden önce yeniden onaya tabi tut veya Resend segmentini ayrıştır.

### P1-C — MFA (operasyonel, enrollment sonrası)

- [ ] Supabase Auth → MFA → TOTP enrollment (admin hesabı).
- [x] Dokümanlardaki `ADMIN_MFA_REQUIRED=on` ifadelerini `true` yap; kod tam olarak `'true'` arıyor.
- [ ] `./set-admin-mfa.sh on` çalıştır ve yeni deploy yap.
- [ ] `aal1` oturumunun yönetici API'lerinde `401`, `aal2` oturumunun `200` verdiğini doğrula.

### P2 — Performans ve dayanıklılık

- [ ] `AdminModal` ve ağır modalları `React.lazy` / dinamik import ile böl; tek `index-*.js` paketini küçült.
- [ ] `update-order-status` geçişini atomik yap (koşullu `PATCH` veya RPC + idempotency); çift “Kargoya Verildi” e-postasını engelle.
- [ ] `list-orders` sayfalama ekle; PII döndüren endpoint'lere `no-store`.
- [ ] Rate limit'leri kalıcılaştır (Cloudflare Rate Limiting / KV / Durable Object); in-memory `Map` temizliği.
- [ ] `subscribe.js` Resend contact/segment hatasını sessizce yutma; Supabase ile Resend arasında uzlaştırma/retry ekle.
- [ ] CSP'yi sıkılaştır: `style-src 'unsafe-inline'` ve `img-src https:` alanlarını daralt.
- [ ] Realtime toast'ı email bazlı RLS ile düzeltme; önce `user_id`/token sahiplik modeli kur.

### Ölçüm — GA4 kararı

- [x] **GA4'ü şimdilik kurma.** Tek ürünlü, düşük trafikli sitede GA4; çerez/KVKK yükü, CSP değişikliği, üçüncü taraf script ve SPA pageview sorunu getirir. AI bot trafiğini de ölçmez.
- **Faydası:** Sayfa görüntüleme, trafik kaynağı, cihaz/şehir, basit dönüşüm hunisi ve Google Ads/remarketing entegrasyonu.
- **Zararı:** KVKK için analitik çerez onayı ve aydınlatma gerekir; Google’a veri aktarımı; CSP’ye `googletagmanager.com`/`google-analytics.com` eklemek gerekir; React SPA’da route değişimlerini ayrıca `page_view` olarak göndermek gerekir; Lighthouse’a üçüncü taraf maliyeti ekler. AI crawler’ları JS çalıştırmadığı için GEO bot trafiğini göstermez.
- **Şimdilik alternatif:** Cloudflare Web Analytics (çerezsiz, ücretsiz, Pages’te tek tık) + GSC/Bing + Supabase sipariş sayısı. AI botları için Cloudflare logları/analytics; AI cevaplarında marka geçişi için manuel kontrol.
- **Snippet uyarısı:** Paylaşılan GA4 kodunu doğrudan `index.html`’e yapıştırma. Mevcut CSP `googletagmanager.com` ve `google-analytics.com` adreslerine izin vermiyor; ayrıca kod onay alınmadan çalışır ve SPA route’larını saymaz.
- [ ] **Cloudflare Web Analytics'i aç** (Pages → Metrics → Enable) ve beacon'ın yüklendiğini doğrula. CSP buna hazır.
- [ ] Haftalık ölçüm: GSC/Bing gösterim-tıklama, Cloudflare sayfa görüntüleme/referrer, Supabase sipariş sayısı.
- [ ] GA4'e ancak Google Ads/remarketing veya gelişmiş funnel gerekirse geç; o zaman onay yönetimi + Consent Mode v2 + CSP + KVKK güncellemesiyle birlikte kur.

### Kullanıcı işleri

- [ ] Google Business Profile (gerçek telefon ve Maps URL).
- [ ] Yandex Webmaster doğrulama + sitemap (panel düzelince).
- [ ] Gerçek müşteri yorumları; doğrulanmadan `AggregateRating` yok.
- [ ] Banka/IBAN, Shopier yazılı onayı ve kargo bilgisi.

## Canlı doğrulama

Her deploy sonrası:

```bash
npm run lint
npm run build
# deploy
curl -i https://tarhanaterapi.com/api/my-orders
curl -I https://tarhanaterapi.com/
```

- `/api/my-orders` kimlik doğrulanmış istekte dahi PII döndürmemeli.
- Ana sayfa, ürün, KVKK ve sitemap `200` dönmeli.
- Yeni CSP/analitik değişikliği varsa console'da CSP hatası olmamalı.
