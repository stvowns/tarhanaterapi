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
- [ ] **Eski siparişler:** 23 Ekim 2026 öncesi siparişlerde token ve `auth_user_id` yok; profil listesinde görünmez. Destek üzerinden yeniden gönderim veya gelecekteki bir sahiplik akışı gerekir.
- [x] **Profil içi sipariş listesi (yeni siparişler):** `orders.auth_user_id` eklendi; `create-order` yalnızca Supabase tarafından doğrulanmış Bearer token'dan gelen kullanıcı kimliğini yazıyor. `/api/my-orders` yalnızca `auth_user_id = auth.uid()` eşleşen siparişleri döndürüyor; e-posta ile arama yok.
- [x] **RLS sahiplik açığı:** Canlıdaki `users can read own orders` politikası `customer_email = auth.jwt()->>'email'` yerine `auth_user_id = auth.uid()` olarak değiştirildi. `anon`/`authenticated` için `INSERT/UPDATE/DELETE` yetkileri kaldırıldı; yazma yalnızca `service_role` üzerinden.
  - Test: aynı e-postaya ait iki siparişten yalnızca `auth_user_id` eşleşen göründü; doğrudan `PATCH` `403` döndü; sentetik kayıtlar ve test kullanıcısı silindi.

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

- [x] `AdminModal` ve `OrderAccessModal` `React.lazy` / dinamik import ile bölündü.
  - Ana paket: ~760,21 KB → ~702,46 KB (gzip ~203,49 → ~191,61 KB).
  - `AdminModal` ayrı chunk ~52,81 KB; `OrderAccessModal` ~5,32 KB.
- [x] Ana paket code-splitting: Vite/Rolldown `codeSplitting` ile React, Supabase ve router ayrı vendor chunk'larına alındı. Uyarı veren 500 KB üstü tek parça kalmadı.
  - Uygulama chunk'ı ~232,47 KB (gzip ~56,11 KB); `react-vendor` ~218,76 KB (gzip ~68,27 KB); `supabase-vendor` ~214,04 KB (gzip ~55,06 KB); `router-vendor` ~37,50 KB (gzip ~13,55 KB).
  - `AdminModal` ~52,91 KB ve `OrderAccessModal` ~5,37 KB ayrı, isteğe bağlı yükleniyor.
  - Toplam ilk yük benzer; kazanç, vendor chunk'larının uzun süre cache'lenmesi ve tek dev dosya yerine paralel indirme.
- [x] `update-order-status` ve Telegram durum geçişini atomik yap.
  - “Kargoya Verildi” için `PATCH ...&status=neq.Kargoya Verildi` kullanılıyor; yalnızca satırı güncelleyen istek e-posta gönderiyor.
  - İkinci/paralel istek `200` dönse de `notified: false` oluyor.
  - SQL düzeyinde ilk koşullu güncelleme satır döndürdü, ikinci güncelleme boş döndü; sentetik `TT-00002` kaydı silindi.
- [x] `list-orders` sayfalama + `no-store`.
  - `?limit=` (varsayılan 500, üst sınır 500) ve `?offset=`; yanıtta `hasMore`.
  - `select=*` yerine yalnızca gerekli alanlar seçiliyor; token hash'i dönmüyor.
  - `list-subscribers` ve diğer PII endpoint'lerinde `Cache-Control: no-store` mevcut.
- [x] **Rate limit'leri kalıcılaştır:** Cloudflare WAF kuralı birincil katman; Supabase `rate_limit_buckets` + `consume_rate_limit` RPC ikinci katman. `create-order`, `subscribe`, `contact-message` ve `submit-review` bu RPC'yi kullanıyor; Supabase erişilemezse in-memory fallback devreye giriyor. Migration canlıya uygulandı; `create-order` testinde bucket sayaçları doğrulandı.
  - Fonksiyon yalnızca `service_role` tarafından çalıştırılabilir; `anon`/`authenticated` yetkisi yok.
  - Eski bucket'lar %1 olasılıkla 1 günden eski olacak şekilde temizleniyor.
- [x] `subscribe.js` Resend contact/segment için 429/5xx retry eklendi; kalıcı hata loglanıyor.
- [x] `./reconcile-resend.sh` / `npm run reconcile:resend`: `marketing_consent=true` ve `unsubscribed_at` boş aboneleri Resend contacts + segmente idempotent şekilde ekler. Anahtarlar ortam değişkeninden okunur, sohbette istenmez.
- [x] CSP `img-src` daraltıldı: `https:` → `'self' data:`. Harici görsel yok; tüm ürün/OG görselleri kendi domaininde.
- [ ] `style-src 'unsafe-inline'` kaldırmak için React inline `style` kullanımları nonce/hash veya CSS sınıflarına taşınmalı; şimdilik bırakıldı.
- [x] Realtime toast: e-posta bazlı güvensiz abonelik kaldırıldı. Profil açıldığında siparişler `/api/my-orders` üzerinden tazeleniyor. Yeni Realtime aboneliği ancak `auth_user_id` filtresi ve düzeltilmiş RLS ile eklenmeli.

### Ölçüm — GA4 kararı

- [x] **GA4'ü şimdilik kurma.** Tek ürünlü, düşük trafikli sitede GA4; çerez/KVKK yükü, CSP değişikliği, üçüncü taraf script ve SPA pageview sorunu getirir. AI bot trafiğini de ölçmez.
- **Faydası:** Sayfa görüntüleme, trafik kaynağı, cihaz/şehir, basit dönüşüm hunisi ve Google Ads/remarketing entegrasyonu.
- **Zararı:** KVKK için analitik çerez onayı ve aydınlatma gerekir; Google’a veri aktarımı; CSP’ye `googletagmanager.com`/`google-analytics.com` eklemek gerekir; React SPA’da route değişimlerini ayrıca `page_view` olarak göndermek gerekir; Lighthouse’a üçüncü taraf maliyeti ekler. AI crawler’ları JS çalıştırmadığı için GEO bot trafiğini göstermez.
- **Şimdilik alternatif:** Cloudflare Web Analytics (çerezsiz, ücretsiz, Pages’te tek tık) + GSC/Bing + Supabase sipariş sayısı. AI botları için Cloudflare logları/analytics; AI cevaplarında marka geçişi için manuel kontrol.
- **Snippet uyarısı:** Paylaşılan GA4 kodunu doğrudan `index.html`’e yapıştırma. Mevcut CSP `googletagmanager.com` ve `google-analytics.com` adreslerine izin vermiyor; ayrıca kod onay alınmadan çalışır ve SPA route’larını saymaz.
- [x] **Cloudflare Web Analytics açık.** Canlı HTML'de `static.cloudflareinsights.com/beacon.min.js` ve `dc0457db0d5044e7803def9dea6411b4` token'ı yükleniyor; CSP hazır.
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

- `/api/my-orders` kimlik doğrulanmamış istekte `401` + `no-store`; yalnızca `auth_user_id` eşleşen siparişleri `200` ile döndürmeli.
- Supabase `orders` tablosunda `anon` okuma boş; `authenticated` yalnızca kendi `auth_user_id` kayıtlarını okuyabilmeli; doğrudan yazma `403` olmalı.
- Ana sayfa, ürün, KVKK ve sitemap `200` dönmeli.
- Yeni CSP/analitik değişikliği varsa console'da CSP hatası olmamalı.
