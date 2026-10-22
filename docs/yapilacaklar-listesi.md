# TarhanaTerapi — Yapılacaklar Listesi

**Tarih:** 22 Ekim 2026
**Canlı site:** https://tarhanaterapi.com (Cloudflare Pages)
**Repo:** https://github.com/stvowns/tarhanaterapi
**Hedef:** AI/arama motorlarında görünürlük (GEO) + satış

**İşaretler:** `[ ]` yapılacak · `[x]` bitti · **(Ben)** asistan · **(Sen)** kullanıcı · **(Birlikte)**

---

## Özet

Teknik GEO altyapısı, hosting taşıması, e-posta/bülten altyapısı, secret rotasyonları ve edge rate limit tamam. Şu an öne çıkan işler:
**(1) ölçüm** (Web Analytics + panel doğrulamaları), **(2) dış otorite** (yorum, Google Business, backlink), **(3) MFA enrollment ve Supabase Auth doğrulaması**.

---

## ✅ Tamamlananlar

### Hosting / altyapı
- [x] Netlify → **Cloudflare Pages** taşıması (functions, `_redirects`, `_headers`, `_routes.json`, `wrangler.toml`)
- [x] `tarhanaterapi.com` DNS + **Universal SSL aktif** (Google Trust Services, 18 Ocak 2027)
- [x] `www.tarhanaterapi.com` → apex **301** (Pages middleware; query string korunuyor)
- [x] HTTP → HTTPS 301, HSTS, CSP ve güvenlik header'ları
- [x] Netlify env değerleri Pages secret olarak taşındı
- [x] **Telegram webhook** yeni adrese alındı: `https://tarhanaterapi.com/api/telegram-webhook` (secret doğrulaması 401/200 test edildi)
- [x] `_routes.json`: statik asset'ler fonksiyona girmiyor (100k limiti güvenli)

### SEO / GEO
- [x] **Google Search Console** DNS TXT doğrulaması + sitemap gönderimi **(Sen)**
- [x] **Bing Webmaster Tools** kaydı + sitemap gönderimi **(Sen)**
- [x] **IndexNow** 18 URL, HTTP 202
- [x] **AI bot testi:** 11 bot × 6 sayfa, hepsi **200**
- [x] **Yandex doğrulama dosyası** canlı: `/yandex_66133422d46f9116.html` → 200 (tam adres, yönlendirmesiz)
- [x] 18 statik prerender sayfa, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`
- [x] JSON-LD: Organization, Product, FAQ, Breadcrumb
- [x] Özel OG görseli
- [x] Canonical / sitemap / JSON-LD / robots hepsi `.com` üzerinde

### İçerik / satış
- [x] 1 kg pamuk torba katalog düzeni, 6 ürüne 6 WebP görsel
- [x] Fiyatlar: klasik 450 · acılı 500 · bebek 500 · set 850 · aile 450 · ikili 900 TL
- [x] Kargo: 2000 TL üzeri ücretsiz, altı 150 TL (frontend + backend + şema)
- [x] KVKK sipariş hatası düzeltildi
- [x] Netlify rozeti kaldırıldı

### Mağaza deneyimi / veri (20 Ekim 2026)
- [x] “Sepete Ekle” düğmesi tek satıra alındı (`whitespace-nowrap shrink-0`); 44 px yükseklik doğrulandı.
- [x] Ürün kartından sağ alt köşeye uçan çuval animasyonu (`FlyToCart.tsx`).
- [x] Sepet satırına tıklayınca ürün sayfasına gidiş (`CartDrawer` → `productUrl`).
- [x] Bülten/e-kitap e-postaları Supabase `subscribers` tablosuna kalıcı kaydediliyor; Resend “TarhanaTerapi Bülten” audience’ına otomatik ekleniyor.
- [x] Yönetici paneli “E-Posta Listesi” artık Supabase’den okuyor; CSV dışa aktarma korundu.
- [x] Yorumlar onay kuyruğuna düşüyor (`verified=false`) + Telegram bildirimi; yönetici paneli “Yorum Onayı” sekmesinden onay/sil.
- [x] E-kitap gerçek PDF olarak hazırlandı; **8 tarif + 11 sayfa**: `public/kadim-corba-rituelleri-ve-sifali-tarifler.pdf`.
- [x] E-kitap üretici script eklendi: `npm run ebook` → `scripts/generate-ebook.ts`.
- [x] `llms.txt` / `llms-full.txt` e-kitap PDF bağlantısı ve “8 tarif” bilgisi eklendi.
- [x] Kargo 150 TL bilgisi tüm site/şema/llms kaynaklarında teyit edildi; sitede “150 TL” metni yok.
- [x] **Soft-404 düzeltildi:** bilinmeyen yollar artık `public/404.html` ile gerçek HTTP 404 döner; `_redirects` SPA fallback kaldırıldı.
- [x] Rehber sayfa başlıkları 65 karakter altına çekildi.
- [x] GEO/SEO denetimi yapıldı: 19/19 URL 200, canonical + tek H1 + JSON-LD doğru, robots/llms/PDF erişilebilir. Rapor: `docs/geo-seo-denetim-2026-10-20.md`.
- [x] 11 AI/search botu × 6 sayfa canlı test: tamamı 200, challenge yok.
- [x] Yayın/e-posta mimarisi dokümante edildi: `docs/email-ve-yayin-mimarisi.md`.

### Güvenlik / e-posta / bülten (22 Ekim 2026)

- [x] **Sipariş durum e-postası** yalnızca durum ilk kez `Kargoya Verildi` olduğunda gönderiliyor; aynı durumun tekrarı ve diğer geçişler mail atmıyor (`update-order-status.js`, `telegram-webhook.js`).
- [x] **Bülten önizleme ve alt bilgisinden** `0850 302 82 74` kaldırıldı.
- [x] **Abonelikten çıkma** gerçek uç noktaya taşındı: HMAC token'lı `GET/POST /api/unsubscribe`; geçerli `200`, geçersiz `400`; Supabase `unsubscribed_at` + Resend güncellemesi.
- [x] Bülten gönderiminde **kişiye özel unsubscribe URL** ve `List-Unsubscribe` / `List-Unsubscribe-Post` başlıkları eklendi.
- [x] **E-kitap PDF ilk sayfasından** `satis@tarhanaterapi.com` kaldırıldı.
- [x] **E-kitap PDF son sayfasındaki adres** `Muradiye Mh., Orhangazi / Bursa` olarak düzeltildi; PDF yeniden üretildi.
- [x] **Supabase RLS sertleştirmesi** uygulandı: `orders`, `order_items`, `subscribers`, `reviews` üzerinde anon INSERT kapalı; public `reviews` yalnızca `verified = true`.
- [x] Public anahtarla geçersiz INSERT artık `42501` / HTTP `401`; public `orders` / `subscribers` SELECT boş.
- [x] **Yönetici API'leri** doğrulanmış Supabase e-postası + allowlist istiyor.
- [x] `create-order` alan/limit doğrulamaları ve **Kapıda Ödeme varsayılan kapalı** (`ALLOW_COD=true` ile açılır).
- [x] **Telegram webhook fail-closed**: secret yoksa/yanlışsa `401`, admin chat ID kontrolü.
- [x] Public **demo login** kaldırıldı.
- [x] CSP/HSTS ve güvenlik başlıkları güncellendi (`public/_headers`).
- [x] `npm run lint`, `node --check`, `npm audit` temiz; prod deploy `0b42380` ile canlıya alındı.
- [x] Denetim kaydı: `docs/guvenlik-denetimi-2026-10-22.md`.
- [x] **Telegram webhook secret'ı rotate edildi**; yeni secret Cloudflare'a yazıldı, webhook güncellendi, bot yanıt veriyor.
- [x] **Resend API key'i rotate edildi**: `tarhanaterapi-prod-2026-10-22` (Full access); Cloudflare secret güncellendi, test maili teslim edildi. Resend panelinde artık 1/1 anahtar var; eski anahtar listede yok.
- [x] **Cloudflare WAF rate limiting**: `API POST abuse protection` kuralı oluşturuldu. `POST /api/*`, IP başına 5 istek/10 sn, Block/10 sn, Active.
- [x] **`admin@tarhanaterapi.com` kaldırıldı**: canlı API allowlist'leri, eski Netlify fonksiyonları, frontend admin kontrolleri, UI footer ve dokümanlar.
- [x] **MFA altyapısı** tamamlandı: TOTP challenge, Admin → Güvenlik enrollment, 7 yönetici API'sinde `tokenAal` + `ADMIN_MFA_REQUIRED`, `./set-admin-mfa.sh on|off`. Enrollment kullanıcı tarafından ertelendi; enforcement şu an kapalı.
- [x] **Profil sipariş geçmişi** ürün detayları + tarih/saat gösterecek şekilde güncellendi; canlı `TT-48214` kartında doğrulandı.
- [x] **`/urunler` listeleme sayfası kaldırıldı**; `/urunler` → `/urunler/tarhana-classic` 301, iç linkler/sitemap/llms/prerender/redirect kuralları güncellendi.

---

## 🔴 P0 — Bu hafta

- [ ] **Cloudflare Web Analytics kur** — **(Sen, 1 dk)**
  - **Workers & Pages → tarhanaterapi → Metrics → Enable** (Pages için tek tık).
  - Alternatif: `https://dash.cloudflare.com/?to=/:account/web-analytics` → Add site → `tarhanaterapi.com`.
  - CSP'ye `static.cloudflareinsights.com` ve `cloudflareinsights.com` eklendi; beacon engellenmeyecek.
  - API'den oluşturulamadı (token'da Account Analytics yetkisi yok). Kurunca beacon'ı ben doğrularım.

- [ ] **Yandex Webmaster: Verify + sitemap** — **(Sen)**
  - Dosya hazır ve 200 dönüyor. Panel şu an Yandex kaynaklı kesintide; düzelince Verify'a bas, sitemap'i bir kez gönder.

- [x] **Sipariş e-postası: Resend** — **(Birlikte)**
  - Domain doğrulandı (DKIM + SPF CNAME'leri), API key Pages secret olarak eklendi.
  - Gönderen adresi `satis@tarhanaterapi.com`; iletişim formu ve sipariş onayı test edildi (delivered).

- [x] **Gelen e-posta: Northwest mailbox** — **(Birlikte)**
  - `satis@tarhanaterapi.com` (ücretsiz plan, 250 MB) aktif.
  - Cloudflare DNS: MX → `mailserver.businessidentity.llc`, SPF (66.223.49.0/24 + 45.88.201.0/24), DKIM `postal-minhmi`, DMARC `p=quarantine`.
  - Gmail'e gönderim testi: mail-tester **10/10**, SPF/DKIM/DMARC pass.

- [x] **Uçtan uca sipariş testi** — **(Birlikte)**
  - Test siparişi `TT-849066`: Supabase kaydı, Telegram bildirimi ve müşteri e-postası (delivered) doğrulandı; test kaydı silindi.

- [x] **Netlify site silindi** — **(Ben)**
  - `tarhanaterapi.netlify.app` API'den silindi (204), canlı adres artık 404. Duplicate host kalmadı.

- [x] **KVKK sayfası + sipariş e-postası** — **(Birlikte)**
  - `/kvkk` sayfası yayında (200, sitemap'te, prerender edilmiş); checkout onay kutusu ve footer bu sayfaya link veriyor.
  - KVKK metni genişletildi: veri sorumlusu, veri kategorileri, hukuki sebepler, yurt dışı aktarım, saklama süreleri, m.11 hakları ve başvuru.
  - Sipariş onay e-postası zenginleştirildi: teşekkür, ürün/adet/fiyat, ara toplam/kargo/toplam, teslimat, ödeme, not, destek ve KVKK linki.
  - Alan adındaki tüm `sifa@` adresleri `satis@` olarak düzeltildi.

- [ ] **Google Business Profile** (Orhangazi / Bursa) — **(Sen)**
  - Adres, telefon, saatler, ürünler, fotoğraflar; site ile birebir NAP tutarlılığı.

- [x] **Telegram webhook secret'ını rotate et** — **(Birlikte)**
  - Yeni secret Cloudflare'a yazıldı, webhook aynı secret ile güncellendi; bot yanıt veriyor ve sipariş bildirimi alındı.

- [x] **Resend API key'ini rotate et** — **(Birlikte)**
  - Yeni anahtar `tarhanaterapi-prod-2026-10-22` (Full access); Cloudflare `RESEND_API_KEY` güncellendi, test maili teslim edildi. Resend panelinde başka anahtar görünmüyor.

- [ ] **Supabase Auth / MFA enrollment** — **(Sen + Ben)**
  - Auth → Providers → Email → “Confirm email”ı aç; Site URL ve redirect URL'leri `https://tarhanaterapi.com` olarak ayarla.
  - Supabase Auth → MFA → TOTP'yi etkinleştir; admin hesabında TOTP enrollment yap.
  - Sonra `./set-admin-mfa.sh on` çalıştır ve deploy et; `ADMIN_MFA_REQUIRED=on` ile yönetici API'leri `aal2` istesin.

- [ ] **API token'ı revoke et** — **(Sen)**
  - Sohbete yazılan Cloudflare token'ı artık gereksiz; deploy'lar `wrangler` oturumuyla yapılıyor.

---

## 🟠 P1 — 2–4 hafta

- [ ] **Gerçek müşteri yorumları** — **(Birlikte)**
  - Site + Google Business. Doğrulandıktan sonra `AggregateRating` şeması (şu an bilerek kapalı; 420/215… sayıları doğrulanmadı).

- [ ] **Google Merchant Center ürün feed'i** — **(Ben)**
  - `id, title, description, link, image_link, price, availability, brand, shipping` içeren XML feed üretilebilir; hesap açılınca bağlanır.

- [ ] **İçerik derinleştirme + şema** — **(Ben)**
  - Hedef sorgular: "tarhana nasıl seçilir", "toz mu granül mü", "bebek tarhanası kaç aylıkken", "katkısız tarhana nasıl anlaşılır", tarif sayfaları.
  - Her sayfaya FAQ + `HowTo`/`Recipe` şeması + iç bağlantı.

- [ ] **Dış atıf / backlink (en kritik GEO işi)** — **(Sen + Ben)**
  - Forum/blog/YouTube/Instagram, yerel basın, influencer, tarif siteleri, ürün inceleme videoları.
  - AI'lar üçüncü taraf bahisleri özetliyor; kendi siten tek başına yetmiyor.

- [ ] **Sosyal profiller + `sameAs`** — **(Birlikte)**
  - Instagram / YouTube / LinkedIn linkleri JSON-LD'ye eklenecek.

- [ ] **Dönüşüm iyileştirmeleri** — **(Birlikte)**
  - Ürün sayfasında fiyat/kargo/teslim/iade tek bakışta; gerçek yorum; karşılaştırma tablosu; "nasıl pişirilir" videosu; WhatsApp/telefon.

- [ ] **GitHub → Cloudflare otomatik deploy** — **(Ben)**
  - Şu an manuel `wrangler pages deploy`. Git entegrasyonu ile push'ta otomatik yayın kurulabilir.

- [x] **Public form koruması: Cloudflare WAF rate limit** — **(Birlikte)**
  - `API POST abuse protection` kuralı: `POST /api/*`, IP başına 5 istek/10 sn, Block/10 sn, Active.
  - Free plan tek kural ve 10 sn period/duration ile sınırlı. Daha ayrıntılı limit veya bot koruması için Turnstile/üst plan değerlendirilebilir.

- [ ] **Banka/IBAN, Shopier ve kargo bilgileri** — **(Sen)**
  - Gerçek banka adı, hesap sahibi ve IBAN; Shopier'den yazılı onay + çalışan ödeme linki; muhasebe onayı ve kargo teklifi netleştirilmeli.

---

## 🟡 P2 — Sonra

- [ ] **AI görünürlük ölçümü** — **(Ben)**
  - Sabit 15–20 sorguluk liste; ChatGPT / Perplexity / Gemini / AI Overviews'ta 2 haftada bir kontrol, tarihli not.

- [ ] **AI bot trafiği izleme** — **(Ben)**
  - Cloudflare GraphQL ile zone trafiği çekilebiliyor (bugün 264 sayfa görüntüleme). Bot kırılımı için Web Analytics veya logpush gerekir.

- [ ] **Core Web Vitals** — **(Ben)**
  - LCP/CLS/INP ölçümü, görsel optimizasyonu (WebP boyutları 100–183 KB).

- [ ] **`llms.txt` / sitemap senkronu** — **(Ben)**
  - Her katalog/fiyat/içerik değişiminde `llms*.txt`, sitemap, şema güncelle + IndexNow çalıştır.

- [ ] **Yerel dizinler ve harita** — **(Sen)**
  - Yerel işletme dizinleri, harita kaydı, tutarlı NAP.

---

## ⚠️ Riskler / Açık Sorunlar

- **E-posta:** Gelen kutusu (`satis@`), manuel gönderim ve otomatik sipariş e-postası (Resend) çalışıyor. Yeni anahtar `tarhanaterapi-prod-2026-10-22`; eski anahtar listede yok.
- **Telegram:** Webhook fail-closed çalışıyor; yeni secret aktif, eski `tarhana-secret-2026` kullanılmıyor.
- **Rate limit:** Cloudflare WAF'ta `POST /api/*` için IP başına 5 istek/10 sn kuralı aktif. Free plan nedeniyle period/duration 10 sn; daha güçlü koruma için Turnstile veya üst plan gerekir.
- **MFA:** Altyapı hazır ancak `ADMIN_MFA_REQUIRED` kapalı; Supabase Confirm email de kapalı. Enrollment yapılmadan admin paneli yalnızca e-posta+şifre ile korunuyor.
- **Doğrulanmamış yorum sayıları:** 420/215/310/180/145/98. Gerçek yorumlarla değiştirilene kadar `AggregateRating` eklenmeyecek.
- **Netlify:** Site silindi; `netlify/` ve `netlify.toml` repodan kaldırıldı. Canlıda yalnızca Cloudflare Pages kullanılıyor.
- **AI garantisi yok:** Altyapı tam olsa bile "önerme" trafiğe, atıflara ve zamana bağlı.
- **Yandex paneli:** Şu an Yandex kaynaklı veri kesintisi var; doğrulama/sitemap işlemleri panel düzelince yapılmalı.

---

## 📊 Ölçüm Planı

| Metrik | Araç | Sıklık |
|---|---|---|
| İndekslenen sayfa sayısı | GSC / Bing WMT | Haftalık |
| Organik tıklama/gösterim | GSC | Haftalık |
| Ziyaret / sayfa görüntüleme / referrer | Cloudflare Web Analytics | Haftalık |
| AI bot ziyaretleri | Cloudflare analytics / loglar | Haftalık |
| AI motorlarında marka geçişi | ChatGPT/Perplexity/Gemini manuel | 2 haftada 1 |
| Dönüşüm (sipariş) | Supabase / admin panel | Haftalık |
| Yorum sayısı/puanı | Site + Google | Aylık |

---

## ▶️ Önerilen sıra

1. **Supabase Auth/MFA enrollment + `./set-admin-mfa.sh on` + deploy** (bugün)
2. **Cloudflare Web Analytics + Yandex doğrulama + API token revoke**
3. **Google Business Profile + gerçek yorumlar**
4. **Merchant Center + içerik/şema + dış atıf** (paralel, sürekli)

> Her büyük değişiklikten sonra: `npm run build` → `npx wrangler pages deploy dist --project-name tarhanaterapi --branch main --commit-hash <tam-sha>` → `npm run indexnow` → canlı doğrulama.
