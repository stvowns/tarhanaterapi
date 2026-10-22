# TarhanaTerapi — GEO / SEO / AI Görünürlük Durum Raporu

**Tarih:** 22 Ekim 2026  
**Kapsam:** canlı site, arama indeksi, AI bot erişimi, agent readiness, Lighthouse, `ruesandora/ruesandora` incelemesi  
**Site:** https://tarhanaterapi.com

> **Güncelleme notu (22 Ekim 2026):** 420+ yorum/puan iddialarının gerçek olmadığı doğrulandı; altı yorum korunacak, “doğrulanmış” ifadesi kaldırıldı. 0850 302 82 74 iptal edilecek. “21 gün fermantasyon” anlatısı kullanılmayacak. Uygulama adımları için `docs/p0-indeks-ve-dizin-todo.md` dosyasına bakın.

---

## Yönetici özeti

Canlı site teknik olarak iyi durumda: 13 sitemap URL'sinin tamamı 200 dönüyor, canonical/H1/JSON-LD temiz, `/urunler` ve kaldırılan ürün URL'leri 301 ile tek ürüne gidiyor, 404 gerçek 404 + `noindex`. AI botlarının tamamı siteyi okuyabiliyor; `isitagentready.com` taraması **Level 3 — Agent-Readable** veriyor.

Ancak **AI önerilerinde görünme** hedefi için üç ciddi engel var:

1. **Arama indeksi eski bilgi gösteriyor.** Canlı site 1 kg tarhanayı **500 TL** ve “uzun dinlendirme yok” olarak anlatırken, web aramasında hâlâ **450 TL**, **21 gün toprak küpte fermantasyon**, kapatılmış acılı/bebek/aile/set ürünleri ve eski **Gedelek Köyü** adresi görünüyor. AI arama katmanları Google/Bing indeksini kullanırsa yanlış bilgiyi kaynak alabilir.
2. **Sosyal kanıt doğrulanmıyor.** Canlı `/api/list-reviews?status=approved` yanıtı **0 yorum** döndürürken ana sayfa ve ürün sayfası **420+ Doğrulanmış Yorum, 4.9/5, %99.4 tekrar satın alma** gösteriyor; altı yorum `mockData` içinden geliyor. Bu, AI ve arama motorları için güven riski; ayrıca tüketici mevzuatı açısından da düzeltilmesi gerekir.
3. **Marka dışı ticari sorgularda görünürlük ve üçüncü taraf atıf zayıf.** `Orhangazi tarhana satın al`, `tarhana satın al 1 kg`, `bebek tarhanası satın al`, `katkısız tarhana nasıl anlaşılır` gibi sorgularda site ilk sonuçlarda görünmüyor. Marka sorgusunda neredeyse yalnızca kendi sayfaları çıkıyor; bağımsız yorum, yerel kayıt, basın veya blog atıfı yok.

**Kısa hüküm:** Site “okunabilir ve alıntılanabilir” seviyede; “güvenilir kaynak olarak tekrar tekrar önerilen marka” seviyesinde değil. Önümüzdeki 30 günde öncelik **indeks temizliği + sahte/doğrulanmamış yorumların kaldırılması + Google Business/Bing doğrulaması + 4 MB ikon fontunun küçültülmesi** olmalı.

---

## 1. Ölçüm kapsamı ve sınırlar

Bu raporda kullanılan yöntemler:

- Canlı sitemap üzerinden 13 URL'nin HTTP, canonical, title, description, H1, JSON-LD kontrolü.
- `scripts/check-ai-access.mjs` ile 11 AI botu × 6 kritik sayfa testi.
- `isitagentready.com` bağımsız ajan taraması.
- Mobil Lighthouse (yerel Chrome; PageSpeed Insights API kotası dolduğu için).
- `site:tarhanaterapi.com` ve marka/ticari sorgu web aramaları.
- Canlı `/api/list-reviews` ve kaynak kod kontrolü.
- `ruesandora/ruesandora` reposunun ve Rueseo sayfalarının incelenmesi.

**Sınır:** ChatGPT, Gemini, Perplexity ve Copilot'un canlı cevapları bu oturumda doğrudan sorgulanamadı; API/hesap erişimi yok. Bu nedenle “AI önerilerinde çıkıyor” **kanıtlanmış değil**. Kanıtlanan şey, botların siteyi okuyabildiği ve teknik GEO sinyallerinin çalıştığı. AI cevap görünürlüğü için sabit soru setiyle ayrı ölçüm gerekir.

PageSpeed Insights API **429 kota** nedeniyle kullanılamadı; Lighthouse yerel Chrome ile çalıştırıldı. Sonuçlar tek seferlik lab ölçümüdür, saha verisi değildir.

---

## 2. Canlı site durumu

### 2.1 Dizin ve yönlendirmeler

| Kontrol | Sonuç |
|---|---|
| Sitemap | 13 URL, tamamı HTTP 200 |
| `/urunler` | 301 → `/urunler/tarhana-classic` |
| Kaldırılan ürün URL'leri | 301 → `/urunler/tarhana-classic` |
| Bilinmeyen URL | 404 + `noindex, follow` |
| `http://` | 301 → HTTPS |
| `www` | 301 → apex |
| Canonical | 13/13 doğru |
| Tek H1 | 13/13 |
| JSON-LD | 13/13 geçerli |
| `lang` | `tr` |
| `hreflang` | `tr` + `x-default` |
| Sitemap `lastmod` | Tamamı `2026-10-21` |

Sitemap URL'leri: ana sayfa, `/urunler/tarhana-classic`, `/icerik`, `/hikaye`, `/yorumlar`, `/iletisim`, `/kvkk`, `/rehber` ve beş rehber yazısı.

### 2.2 AI'ya dönük dosyalar ve başlıklar

| Sinyal | Durum |
|---|---|
| `robots.txt` | 200, AI botlarına açık, `Sitemap` var |
| `Content-Signal` | `search=yes, ai-input=yes, ai-train=yes` (robots + HTTP header) |
| `llms.txt` | 200, güncel fiyat/kargo/iletişim özeti |
| `llms-full.txt` | 200, tam SSS/politika metni |
| Markdown negotiation | 200, `text/markdown; charset=utf-8` |
| `.md` kardeşleri | 200 |
| `Link` header | Sayfa bazlı `alternate` + `describedby` |
| `auth.md` | 200 |
| `/.well-known/security.txt` | 200 |
| `Vary: Accept` | Var |
| `X-Markdown-Tokens` | Markdown yanıtlarında var |

Bu, sitenin en güçlü tarafı. AI botları için “kapı açık” ve içerik makine okunur durumda.

### 2.3 Güvenlik ve altyapı (SEO/GEO'yu dolaylı etkiler)

- HSTS, CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` aktif.
- Cloudflare WAF rate limit yalnızca `POST /api/*` için; GET crawler trafiğini etkilemiyor.
- Cloudflare Pages auto-deploy aktif; canlı `/urunler` 301 ve ürün sayfası 200.
- Resend anahtarı döndürüldü; `admin@tarhanaterapi.com` kaldırıldı; MFA kullanıcı ertelemesi nedeniyle açık değil. Bunlar SEO raporunun dışında, operasyonel durum notu.

---

## 3. AI botları ve agent readiness

### 3.1 Bot erişim testi

`node scripts/check-ai-access.mjs https://tarhanaterapi.com` sonucu:

| Bot | 6 kritik sayfa |
|---|---|
| Googlebot | 200 / 200 / 200 / 200 / 200 / 200 |
| Bingbot | 200 / 200 / 200 / 200 / 200 / 200 |
| OAI-SearchBot | 200 / 200 / 200 / 200 / 200 / 200 |
| ChatGPT-User | 200 / 200 / 200 / 200 / 200 / 200 |
| PerplexityBot | 200 / 200 / 200 / 200 / 200 / 200 |
| Perplexity-User | 200 / 200 / 200 / 200 / 200 / 200 |
| Claude-SearchBot | 200 / 200 / 200 / 200 / 200 / 200 |
| Claude-User | 200 / 200 / 200 / 200 / 200 / 200 |
| GPTBot | 200 / 200 / 200 / 200 / 200 / 200 |
| CCBot | 200 / 200 / 200 / 200 / 200 / 200 |
| Applebot | 200 / 200 / 200 / 200 / 200 / 200 |

Challenge, 403 veya boş içerik yok. Cloudflare canlı davranışı AI botlarına karşı açık.

### 3.2 Agent readiness taraması

`isitagentready.com` sonucu: **Level 3 — Agent-Readable**.

Geçenler:

- `robots.txt` geçerli
- `sitemap.xml` geçerli
- `Link` header: `alternate`, `describedby`
- Markdown negotiation
- AI bot kuralları (13 bot için açık kural)
- `Content-Signal`

Geçmeyen/opsiyonel olanlar:

- DNS-AID kaydı yok (opsiyonel)
- API Catalog yok (herkese açık API olmadığı için bilinçli)
- OAuth/OIDC discovery yok (site OAuth sunucusu değil)
- MCP Server Card, A2A Agent Card, Agent Skills, WebMCP yok (gerçek servis olmadığı için bilinçli)
- Commerce protokolleri (x402, UCP, ACP, AP2) yok; mevcut ödeme modeli buna uygun değil

Bu maddelerin çoğu **eksiklik değil**, iş modeline uygun olmayan opsiyonel katmanlar. Level 3 bu site için yeterli.

### 3.3 Kritik AI/arama altyapısı eksiği: Bing doğrulaması

- `/BingSiteAuth.xml` → **404**
- Google DNS TXT doğrulaması var
- Yandex doğrulama dosyası var
- IndexNow anahtarı yayında

Bing doğrulaması Google Search Console içe aktarma veya DNS ile yapılmadıysa **Bing Webmaster Tools'ta site doğrulanmamış** demektir. ChatGPT Search ve Microsoft Copilot Bing indeksini kullandığı için bu, AI görünürlüğünde doğrudan risk. Bu madde P0/P1'dir.

Ayrıca Cloudflare AI Crawl Control panel ayarı API token yetkisi olmadığı için okunamadı; canlı testler açık olduğunu gösteriyor. Panelde Search/Agent/Training'in **Allow** kaldığı ayrıca doğrulanmalı.

---

## 4. GEO/SEO güçlü yanlar

1. **Marka tanımı net:** “Bursa Orhangazi'de aile tarifiyle katkısız geleneksel tarhana üreten aile işletmesi.” Ana sayfa, llms ve schema aynı tanımı kullanıyor.
2. **Kısa cevap blokları var:** fiyat, kargo, içindekiler, alerjen, saklama, bebek kullanımı tek tek yanıtlanıyor.
3. **FAQ yapısı güçlü:** ana sayfa, ürün ve rehberlerde SSS + `FAQPage` schema var.
4. **Tablo ve karşılaştırma:** ürün tablosu, içindekiler, besin değerleri, kargo/iade bilgisi.
5. **Schema zemini iyi:** `Organization`, `Store`, `Product`, `Offer`, `OfferShippingDetails`, `BreadcrumbList`, `Article`, `FAQPage`.
6. **AI dosyaları tam:** `llms.txt`, `llms-full.txt`, markdown kardeşleri, `Link` header, `auth.md`, `security.txt`.
7. **Yönlendirme disiplini:** `/urunler` ve eski ürünler 301; 404 gerçek 404; soft-404 yok.
8. **İç link ağı:** ana sayfa → ürün, rehberler → ürün, rehber index → rehberler.
9. **Yerel sinyaller:** adres, çalışma saatleri, üretim yeri, kargo süresi, iletişim.
10. **Şeffaf sınırlar:** glutensiz değildir, çölyak için uygun değildir, sağlık iddiası yoktur; bu AI güveni için olumlu.

---

## 5. Kritik boşluklar ve riskler

### 5.1 P0 — Arama indeksi eski bilgi gösteriyor

Canlı site doğru; ancak 22 Ekim 2026 web aramalarında eski sürümler hâlâ görünüyor:

| Konu | Canlı site | Arama indeksinde görünen eski bilgi |
|---|---|---|
| Fiyat | 1 kg 500 TL | 450 TL |
| Üretim | Güneşte/hava akımında kurutma; uzun dinlendirme yok | “21 gün toprak küpte fermantasyon” |
| Ürün yapısı | Tek klasik ürün | Acılı, bebek, aile, set, ikili gurme |
| Adres | Muradiye Mh., Orhangazi / Bursa | Gedelek Köyü Mevkii No: 28 |
| İletişim | E-posta + Orhangazi atölyesi | 0850 telefon + “İstanbul tadım noktası” |
| Yorum | 420+ (statik) | 145+ Değerlendirme |

Bu, canlı sitenin hatası değil; **arama motoru önbelleği/indeks tazeliği** sorunu. Ancak AI arama katmanları çoğu zaman canlı sayfayı değil, arama indeksindeki snippet'i kullanır. Bu nedenle AI, “TarhanaTerapi 450 TL” veya “21 gün fermente” diyebilir.

**Kanıt niteliğinde örnekler:**
- `site:tarhanaterapi.com` sonucunda ana sayfa başlığı “Nohutlu Hakiki Anne Tarhanası | 21 Gün ... 1 kg 450 TL” olarak göründü.
- `/urunler/tarhana-classic` sonucu “Geleneksel Nohutlu Anne Tarhanası — 450 TL” olarak göründü.
- `/urunler/tarhana-baby`, `/urunler/tarhana-spicy`, `/urunler/tarhana-starter-set`, `/urunler/tarhana-family-pack` hâlâ eski fiyatlarla indeksli.
- Rehber yazılarında “21 gün toprak küpte fermente” eski metni görünüyor.
- `/iletisim` sonucu “İstanbul tadım noktası” ve 0850 telefonu gösteriyor; canlı iletişim sayfasında bunlar yok.

**Ne yapmalı:**
1. Google Search Console'da 13 güncel URL için **URL Inspection → Request Indexing**.
2. Eski URL'ler için **Remove Outdated Content** talebi; 301'ler zaten doğru, ek olarak kaldırma talebi hızlandırır.
3. Bing Webmaster Tools'ta siteyi doğrula; tüm URL'leri **Submit URL** ve IndexNow ile gönder.
4. Sitemap `lastmod` ve sayfa `dateModified` değerlerini gerçek değişiklik tarihine çek; tüm sayfalara aynı tarihi verme.
5. Instagram bio, Google Business Profile, varsa pazaryeri ilanları, eski e-kitap/PDF ve dış profillerde 450 TL / 21 gün / eski adres bilgisini tara ve güncelle.
6. 3–7 gün sonra `site:` ve marka sorgularını tekrar kontrol et; gerekirse eski URL'leri 410'a çevirmeyi ayrıca değerlendir (301 link değeri için şu an daha doğru).

**Neden P0:** AI'nın yanlış fiyat/üretim bilgisi vermesi, satın alma kararını ve marka güvenini doğrudan bozar.

### 5.2 P0 — Yorumlar ve sosyal kanıt doğrulanmıyor

Canlı API:

```text
GET /api/list-reviews?status=approved
{"success":true,"status":"approved","count":0,"reviews":[]}
```

Buna rağmen:

- Ana sayfa: **420+ Doğrulanmış Yorum**, **4.9/5**, “Gerçek alıcı deneyimleri”
- Ürün sayfası: **4.9 / 5 · 420 değerlendirme**
- Yorumlar sayfası: **420+ Doğrulanmış Sipariş**, **%99.4 Tekrar Satın Alma Oranı**, 395/21/4 yıldız dağılımı
- Altı yorum `src/data/mockData.ts` içinden geliyor ve “Doğrulanmış Alıcı” etiketiyle gösteriliyor.

Kodda `AggregateRating` schema'sının bilinçli olarak eklenmemesi doğru bir karar; ancak görünür metin aynı iddiayı yapıyor. Bu durum:

- AI'ya “doğrulanmış 420 yorum” olarak yansıyabilir; sonra kaynakta 0 yorum görülünce güven kaybı olur.
- Google'ın yorum/zengin sonuç politikaları ve tüketici mevzuatı açısından risk taşır.
- “145+” eski indeks ve “420+” canlı site arasında tutarsızlık yaratır.

**Ne yapmalı:**
1. Gerçek yorum yoksa **420+, 4.9/5, %99.4, “Doğrulanmış Yorum/Alıcı”** ifadelerini kaldır.
2. Yorum bölümünü API'deki onaylı yorum sayısına bağla; 0 ise “Henüz yayınlanmış yorum yok” veya bölümü gizle.
3. `mockData` yorumlarını gerçek değilse yayından kaldır; “örnek” etiketiyle bile gösterme.
4. Yorumlar gerçekten varsa Supabase'e onaylı olarak aktar, sayıyı API'den türet; ancak ondan sonra `AggregateRating` düşün.
5. Ürün sayfasındaki statik `4.9 / 420` alanını da aynı kaynağa bağla.

**Neden P0:** AI öneri sistemleri için “güvenilir marka” sinyali en kritik unsurdur; doğrulanmamış sosyal kanıt bu sinyali tersine çevirir.

### 5.3 P0/P1 — Marka dışı görünürlük ve üçüncü taraf atıf eksikliği

Web aramalarında:

- `"TarhanaTerapi"` → neredeyse tamamı kendi sayfaları.
- `Orhangazi tarhana satın al` → site ilk sonuçlarda yok; yabancı/uluslararası ürünler çıkıyor.
- `tarhana satın al 1 kg` → Trendyol, Hepsiburada, Nermin Hanım, Gizemin Bahçesi gibi pazaryerleri/markanın dışındaki siteler.
- `bebek tarhanası satın al` → Trendyol, OG Store, e-bebek, Beyorganik.
- `katkısız tarhana nasıl anlaşılır` → YouTube/Instagram ve başka bloglar; site yok.
- `TarhanaTerapi Orhangazi Bursa` → ilgisiz masaj/terapi işletmeleri; yerel işletme kaydı görünmüyor.

Bu, “bot erişimi” değil **otorite/atıf** sorunu. AI cevapları tek kaynakla değil, birbirini doğrulayan kaynaklarla çalışır. Site kendi kendini anlatıyor; bağımsız kaynaklar doğrulamıyor.

**Ne yapmalı:**
1. **Google Business Profile** (Orhangazi) oluştur: kategori “Gıda üreticisi / baharat ve çorba”, adres, saatler, ürünler, fotoğraflar, web sitesi, Instagram.
2. Bing Places ve Apple Business Connect'e ekle.
3. Yerel kayıtlar: Orhangazi/Bursa esnaf odası, yerel gıda rehberleri, kadın kooperatifi/girişim listeleri (uygunsa).
4. 5–10 bağımsız atıf: yerel haber, yemek bloğu, anne/bebek blogu, influencer/iş birliği, ürün yorumu.
5. Instagram içeriklerini siteye gömme yerine, alıntılanabilir “üretici hikayesi” ve “üretim süreci” sayfası olarak tut; sosyal kanıtı siteye taşı.
6. Marka adındaki “Terapi” nedeniyle oluşan karışıklık için schema ve sayfa metinlerinde **“geleneksel tarhana üreticisi; sağlık/terapi hizmeti değildir”** ayrımını net tut.

### 5.4 P0/P1 — Entity, NAP ve iletişim tutarlılığı

- Canlı `/iletisim` sayfasında telefon yok; yalnızca e-posta ve adres var.
- `llms.txt`, `llms-full.txt`, KVKK, mesafeli satış ve `Organization`/`Store` schema'da **0850 302 82 74** var.
- Arama indeksi eski “İstanbul tadım noktası”nı gösteriyor; canlı sayfada yok.
- E-posta, Cloudflare Email Obfuscation nedeniyle HTML'de `[email protected]` olarak görünüyor; gerçek adres meta/JSON-LD/llms'de var. JS çalıştırmayan AI crawler'ları için iletişim sayfası daha az okunur.

**Karar gerekiyor:** 0850 numarası gerçekten aktif ve müşteri iletişimi için kullanılıyor mu?
- Evet ise `/iletisim` sayfasına ekle; schema/llms ile aynı olsun.
- Hayır ise schema, llms, KVKK ve mesafeli satıştan kaldır; tek doğru kanal e-posta olsun.
- Her iki durumda da tek bir NAP (name/address/phone) seti kullan.

Ayrıca `sameAs` yalnızca Instagram içeriyor. Google Business Profile, Bing Places, varsa Facebook/YouTube eklenmeli. Yoksa oluşturulmalı.

### 5.5 P1 — İçerik ve E-E-A-T boşlukları

- Ürün sayfası rehberlere bağlanmıyor; rehberler ürüne bağlanıyor. Ürün sayfasına “Bilgi rehberleri” bölümü ekle: pişirme, saklama, katkısız tarhana, bebek kullanımı.
- Bebek beslenmesi ve gıda güvenliği rehberlerinde **kaynakça yok**. “Doktora danışın” var; ancak WHO/UNICEF, Sağlık Bakanlığı veya güvenilir pediatri kaynaklarına atıf yok. Google'ın Ekim 2026 üretken AI içerik rehberi ve AI güveni için kaynak/bağlam önemli.
- Üretici kimliği yalnızca “aile işletmesi”; isim, deneyim, üretim sorumlusu, parti/izlenebilirlik bilgisi yok. E-E-A-T için gerçek bilgiyle güçlendirilebilir.
- “Orhangazi tarhana” için ayrı, yerel niyetli bir sayfa yok. Ana sayfa ve ürün sayfası Orhangazi'yi söylüyor; ancak ayrı bir “Orhangazi'de tarhana üretimi” içeriği yerel aramada fırsat.
- “Bebek tarhanası” ve “acılı tarhana” istek üzerine; ayrı ürün sayfası açmak yerine **açıklayıcı içerik + SSS** sayfaları açılabilir. Satılmayan varyant için `Product` schema üretme.
- Eski “21 gün fermantasyon” iddiasıyla ilgili net bir SSS yok. “Tarhana 21 gün fermente mi?” sorusuna “Hayır, uzun dinlendirme yok; hamur güneşte/hava akımında kurutulur” cevabı, eski indeksin yol açtığı karışıklığı azaltır.
- Fiyat sayfası tek ürünlü; “1 kg tarhana fiyatı” ve “kargo ücreti” zaten yanıtlanıyor; yine de AI'nın doğrudan alıntılayacağı kısa “Fiyat ve kargo” tablosu ürün sayfasında daha görünür olabilir.

### 5.6 P1 — Performans: mobil Lighthouse 78

| Metrik | Değer |
|---|---:|
| Performance | **78** |
| Accessibility | **93** |
| Best Practices | **100** |
| SEO | **92** |
| FCP | 2.6 s |
| LCP | **4.8 s** |
| TBT | 0 ms |
| CLS | 0.039 |
| Toplam ağırlık | **4.53 MB** |
| Font ağırlığı | **4.15 MB** |
| Material Symbols fontu tek başına | **4.00 MB** |

En büyük sorun: **Material Symbols Outlined** fontu 4 MB. Sayfada 128 kullanım, 65 benzersiz ikon var. Bu font tek başına toplam sayfa ağırlığının ~%88'i.

Diğer bulgular:

- LCP elementi bir metin paragrafı; render gecikmesi 4.2 s. Font/JS yükü render'ı geciktiriyor.
- Hero görseli 1000×1000 üretilmiş, 380×380 gösteriliyor; ~105 KB gereksiz.
- Ingredients görseli 760×523, 380×262 gösteriliyor; ~75 KB gereksiz.
- Google Fonts CSS render-blocking: ~828 ms.
- Material Symbols font-display: ~455 ms.
- Kullanılmayan JS: ~106 KB.
- Cache TTL sorunu küçük (~4 KB, çoğu üçüncü taraf Cloudflare beacon).

**Hızlı kazanım:**
1. Material Symbols linkini `icon_names=` ile yalnızca kullanılan 65 ikona indir; tek ağırlık (400) ve `display=swap` kullan. Örnek:
   `family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names=...&display=swap`
2. Alternatif: ikonları inline SVG/lucide-react'e taşı; fontu tamamen kaldır.
3. Hero ve ingredients için `srcset`/`sizes` ile 400/800 px varyantları üret; WebP/AVIF sıkıştır.
4. Kritik CSS'i inline et veya Google Fonts CSS'ini self-host et; `preload` ile yalnızca kullanılan font dosyalarını yükle.
5. JS bundle'ı route bazlı böl; kullanılmayan bileşenleri lazy load et.
6. Değişiklik sonrası tekrar Lighthouse çalıştır; hedef Performance ≥90, LCP ≤2.5 s.

### 5.7 P1 — Erişilebilirlik: 93

Lighthouse'ta üç sorun:

1. **Kontrast:** 12 px metinlerde `#8c716b` / `#fff8f7` oranı **4.26:1**; gereken 4.5:1. Reçete adımlarındaki küçük açıklamalar.
2. **Başlık sırası:** H4'ler H3 olmadan kullanılıyor (ör. “Pamuk Torbada Tazelik”, “Taş Değirmen Buğday Unu”). H3'e çevir veya ara başlık ekle.
3. **Label-content-name mismatch:** Sepet butonu `aria-label="Sepeti aç"`; görünen metin “shopping_bag 1”. Erişilebilir adı görünen metni içermeli: “Sepeti aç, 1 ürün” gibi. İkon fontunu `aria-hidden` yap.

Bunlar düşük riskli, hızlı düzeltmeler; erişilebilirlik 100'e çıkabilir.

### 5.8 P2 — Tazelik ve tarih sinyalleri

- `CONTENT_UPDATED = '2026-10-21'` tüm sayfalara global olarak uygulanıyor.
- Sitemap'te 13 URL'nin tamamı aynı `lastmod` tarihini taşıyor.
- Rehberlerin `datePublished` değeri aynı: `2026-10-21`.
- `llms.txt` ve `llms-full.txt` “Son güncelleme: 21 Ekim 2026” diyor; bazı dosyalar 22 Ekim'de değişti.

Rueseo'nun önerisi doğru: **sitemap `lastmod` git'ten gelsin**. Böylece her sayfa gerçekten değiştiği tarihi taşır; Google ve AI tazelik sinyalini daha güvenilir okur. Kısa vadede tüm sayfaları 22 Ekim yapmak yerine, gerçekten değişen sayfaların tarihini güncelle.

### 5.9 P3 — Lighthouse SEO 92: `robots.txt` “Unknown directive”

Lighthouse'un tek SEO hatası:

```text
Line 4: Content-Signal: search=yes, ai-input=yes, ai-train=yes
Error: Unknown directive
```

Bu, `Content-Signal`'ın Lighthouse tarafından bilinmemesinden kaynaklanıyor. Googlebot bilinmeyen direktifleri yok sayar; işlevsel bir hata değil. `isitagentready.com` bu satırı geçerli sayıyor. **Sırf 100 puan için robots'tan kaldırmayı önermiyorum**; aynı sinyal HTTP header'da da var, ancak robots'tan okuyan ajanlar için değerli. Alternatif: yalnızca header'da tutup robots'tan çıkar; bu durumda agent readiness “Content-Signal” kontrolü zayıflar. SEO puanı 92 kalması ranking açısından sorun değil.

### 5.10 P2 — Küçük tutarsızlıklar

- Kapıda ödeme: “yakında yeniden etkinleştirilecektir” metni checkout, legal ve llms'de var; COD `ALLOW_COD=true` değilse kapalı. AI için daha net ifade: “Şu anda yalnızca Havale/EFT; kapıda ödeme devre dışı.”
- Telefon: yukarıda 5.4.
- E-posta obfuscation: iletişim sayfasında gerçek e-posta JS ile açılıyor; AI crawler için schema/llms'de gerçek adres var, ama sayfa metni `[email protected]`. Cloudflare Email Obfuscation kapatılabilir veya `<noscript>`/plain text e-posta eklenebilir.
- `X-Markdown-Tokens` dokümanda var; canlı HEAD yanıtında görünmedi (GET'te olabilir). Kritik değil.

---

## 6. Lighthouse özeti ve yorum

| Kategori | Puan | Yorum |
|---|---:|---|
| Performance | 78 | 4 MB ikon fontu ve görsel boyutları ana neden |
| Accessibility | 93 | Kontrast, başlık sırası, sepet butonu |
| Best Practices | 100 | Güvenlik/başlıklar iyi; source map eksikliği ağırlıklı değil |
| SEO | 92 | Tek neden `Content-Signal`; işlevsel değil |

**En yüksek etkili performans işi:** Material Symbols'ı küçültmek. 4 MB font kalkarsa toplam ağırlık ~0.5 MB'a iner; LCP ve FCP belirgin iyileşir.

---

## 7. `ruesandora/ruesandora` incelemesi

### 7.1 Repo ne içeriyor?

- Repo yalnızca **54 satırlık `README.md`** içeriyor.
- Uygulama kodu, paket, lisans, script veya entegre edilecek bir kütüphane yok.
- README, Rues'un **Rueseo** adlı danışmanlık/hizmet işini tanıtıyor: business development, SEO/GEO/AEO, app development, growth, AI agents, code support, e-commerce, branding, second brain.

Yani bu repo **doğrudan projeye eklenebilecek bir yazılım değil**; bir profil/hizmet README'si.

### 7.2 Ruescan kullanılabilir mi?

README, **Ruescan** adlı ücretsiz site kontrol aracını tanıtıyor: ana sayfa, robots.txt, sitemap, llms.txt ve mobil PageSpeed'i okuyup 6 alanda bulgu veriyor.

Ancak 22 Ekim 2026 itibarıyla:

- `https://ruesandora.com/tools/site-check` → ana sayfaya dönüyor.
- `https://ruesandora.com/tr/araclar/site-analizi` → ana sayfaya dönüyor.
- Ana sayfada “Ruescan açılınca ilk sen haber al” bekleme listesi var.

Yani Ruescan **henüz canlı değil**; bu rapor için çalıştırılamadı. Repo üzerinden doğrudan bir katkı da yok.

### 7.3 Repodan alınabilecek asıl katkı: metodoloji

Repo kod değil, ama Rueseo'nun yayınladığı yöntem bu projeye uyarlanabilir:

- **“Found → cited → named → recommended”** çerçevesi: önce bulunma, sonra alıntılanma, sonra adıyla anılma, en son önerilme.
- **Sabit soru setiyle AI cevap ölçümü:** aynı soruları ChatGPT, Gemini, Perplexity ve Copilot'a düzenli sormak; cevap değişken olduğu için tekrar tekrar ölçmek.
- **Bot's-eye test:** sayfayı ziyaretçi ve bot gözüyle karşılaştırmak.
- **Trap URL testi:** olmayan URL'lerde doğru status kodu.
- **Mirror schema:** schema'yı yalnızca sayfada görünen içerikle eşleştirmek.
- **Quote blocks:** kısa cevap, tanım, tablo, SSS blokları.
- **AI mirror:** AI'nın marka hakkında söylediği yanlışları kaynağında düzeltmek.
- **Query gap:** Search Console'da gösterim alıp tıklama almayan sorguları doğru sayfaya bağlamak.
- **Orphan page hunt:** iç link almayan sayfaları bağlamak.
- **Git tabanlı sitemap `lastmod` + IndexNow.**
- **“No data, no claim”:** doğrulanamayan hiçbir sayı/iddia yayınlanmaz.

Bu yöntem, sitenin mevcut GEO altyapısını tamamlar; özellikle **ölçüm ve üçüncü taraf atıf** tarafında eksik.

### 7.4 Rueseo makalelerinden çıkan uygulanabilir dersler

1. **Robots.txt for AI bots:** Arama botlarını (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot) aç; eğitim botları ayrı karar. Bizde hepsi açık; bu, AI görünürlüğü hedefiyle uyumlu.
2. **Google'ın Ekim 2026 üretken AI içerik rehberi:** AI kullanımı serbest; ancak değer katmayan ölçekli içerik cezalandırılabilir; her AI çıktısı manuel fact-check edilmeli; içeriğin nasıl üretildiği bağlamı verilmeli. Bizde rehberlerde kaynak/bağlam eksik.
3. **Bilingual/hreflang:** Şu an tek dilli site için gerekli değil. İhracat/İngilizce hedefi olursa Rueseo'nun `/` EN + `/tr/` TR, 301 ve x-default modeli örnek alınabilir. Şimdi yapay bir `/en` eklemek doğru olmaz.
4. **AI eski bilgiyi tekrar edebilir:** Bizim 450 TL / 21 gün örneği tam olarak bu. Çözüm: düzenli ölçüm + indeks temizliği + dış profillerin güncellenmesi.

### 7.5 Repo projeye nasıl katkı sağlar?

| Katkı türü | Değerlendirme |
|---|---|
| Doğrudan kod entegrasyonu | **Yok**; repo kod içermiyor |
| Ücretsiz Ruescan audit'i | **Şu an yok**; araç canlı değil |
| Metodoloji/checklist | **Yüksek**; 12 iş kalemi ve AI ölçüm çerçevesi uyarlanabilir |
| İçerik/araştırma | **Orta**; robots, Google AI rehberi, hreflang yazıları kullanılabilir |
| Dış danışmanlık | **Opsiyonel**; Rueseo hizmet olarak alınabilir, ancak repo bunun için gerekli değil |

**Sonuç:** Repo bir bağımlılık değil, bir **audit/ölçüm çerçevesi**. Projeye katkısı, Ruescan'ı beklemek değil; onların “sabit soru seti + bot gözü + mirror schema + no unverified claim” yöntemini içeride uygulamak.

---

## 8. Ruescan'ın 6 alanına göre hızlı durum

| Alan | Durum | Not |
|---|---|---|
| AI botları ve erişim | ✅ Güçlü | 11 bot × 6 sayfa 200; challenge yok |
| Sitemap ve indeksleme | ⚠️ Karışık | Canlı sitemap iyi; arama indeksi eski |
| AI'ya hazır içerik | ✅ Güçlü | Kısa cevap, SSS, tablo, llms |
| Yapısal veri | ✅/⚠️ | Schema güçlü; yorum/telefon tutarlılığı zayıf |
| Meta ve paylaşım | ✅ Güçlü | Title/description/canonical/OG iyi |
| Hız ve güvenlik | ⚠️ | Güvenlik iyi; hız zayıf (4 MB font, LCP 4.8) |

---

## 9. Öncelikli yol haritası

### P0 — 0–3 gün: yanlış bilgiyi ve güven riskini kes

1. **İndeks temizliği**
   - GSC: 13 güncel URL için URL Inspection + Request Indexing.
   - Eski ürün URL'leri için Remove Outdated Content.
   - Bing Webmaster doğrulaması + URL submission + IndexNow.
   - `site:` ve marka sorgularını 3–7 gün sonra tekrar kontrol et.
2. **Yorum/sosyal kanıt**
   - 420+, 4.9/5, %99.4, “Doğrulanmış” etiketlerini kaldır veya gerçek API sayısına bağla.
   - `mockData` yorumlarını gerçek değilse yayından kaldır.
   - Ürün sayfasındaki statik 4.9/420'yi de düzelt.
3. **NAP/entity**
   - 0850 telefonu için karar: iletişim sayfasına ekle veya her yerden kaldır.
   - Google Business Profile oluştur; `sameAs` ve yerel kayıtları ekle.
   - “Terapi” adı karışıklığı için üretici tanımını netleştir.
4. **Performans hızlı kazanımı**
   - Material Symbols'ı `icon_names` ile subsetle veya SVG'ye geç.
   - `display=swap` ekle; hero/ingredients için responsive görsel üret.
   - Tekrar Lighthouse çalıştır.

### P1 — 1–2 hafta: otorite ve içerik

5. **Bing doğrulaması + IndexNow** (P0 ile birlikte).
6. **Sitemap `lastmod` ve `dateModified`**: git tabanlı, sayfa bazlı.
7. **İçerik**
   - Ürün sayfasına rehber linkleri.
   - Bebek/gıda güvenliği rehberlerine kaynakça.
   - “Orhangazi tarhana” yerel sayfası.
   - “21 gün fermantasyon yok” SSS'i.
   - “Bebek tarhanası / acılı tarhana istek üzerine” açıklayıcı içerik.
8. **Üçüncü taraf atıf**
   - 5–10 bağımsız mention: yerel haber, blog, influencer, işletme kaydı.
   - Google yorumları (gerçek müşterilerden).
9. **Erişilebilirlik**
   - Kontrast, H3/H4 sırası, sepet butonu label'ı.
10. **İç link**
    - Ürün → rehber, rehber → ürün, yerel sayfa → ürün.

### P2 — sürekli: ölçüm ve iyileştirme

11. **AI cevap ölçümü**: 20–30 sabit soru; ayda bir ChatGPT/Gemini/Perplexity/Copilot/AI Overviews; mention, citation, doğruluk.
12. **Search Console query gap**: gösterim alıp tıklama almayan sorguları sayfalara bağla.
13. **İçerik tazeleme**: fiyat/stok/kargo değişince llms + ürün + schema + sitemap birlikte.
14. **Aylık teknik kontrol**: sitemap 200, bot erişimi, Lighthouse, kırık link.

---

## 10. AI cevap ölçüm seti (başlangıç)

Her soru 3–5 kez, farklı günlerde sorulmalı; cevaplar değişken olabilir. Kayıt tablosu: tarih, motor, soru, marka geçti mi, kaçıncı sırada, hangi URL kaynak, bilgi doğru mu, not.

Örnek sorular:

1. TarhanaTerapi nedir, ne üretiyor?
2. TarhanaTerapi'nin 1 kg fiyatı ne kadar?
3. TarhanaTerapi güvenilir mi?
4. Orhangazi'de katkısız tarhana nereden alınır?
5. Bursa'da ev yapımı tarhana satan yerler?
6. Bebek tarhanası önerir misin?
7. Katkısız tarhana nasıl anlaşılır?
8. Ev tarhanası ile hazır tarhana arasındaki fark nedir?
9. Tarhana neden ekşir?
10. Tarhana nasıl saklanır?
11. 1 kg tarhana fiyatı ne kadar?
12. Tarhana kargo ücreti ne kadar?
13. Tarhana glutensiz mi?
14. Tarhana 21 gün fermente mi?
15. TarhanaTerapi kapıda ödeme yapıyor mu?

İlk ölçümde “marka geçti mi” sorusu çoğu ticari soruda muhtemelen “hayır” çıkacak; bu bir başarısızlık değil, başlangıç çizgisi.

---

## 11. Alınan kararlar

1. **0850 302 82 74 iptal edilecek.** Schema, `llms.txt`, `llms-full.txt`, `auth.md`, `security.txt`, KVKK, mesafeli satış ve statik JSON-LD’den kaldırıldı. Gerçek bir telefon yoksa iletişim yalnızca e-posta üzerinden yürüyecek.
2. **420+ yorum / 4.9 puan gerçek değil.** Altı yorum korunacak; “Doğrulanmış Yorum/Alıcı”, 420+, 4.9/5 ve %99.4 ifadeleri kaldırıldı. Toplu yorum sayısı/ortalama puan iddiası yayınlanmayacak.
3. **“21 gün fermantasyon” anlatısı kullanılmayacak.** Canlı metinler güneşte/hava akımında kurutma anlatısını kullanıyor; eski indeksin temizlenmesi gerekiyor.
4. **Google Business Profile açılıyor.** Yerel görünürlük ve üçüncü taraf doğrulama için takip edilecek.
5. **İngilizce site şimdilik gerekli değil.** İhracat hedefi yoksa hreflang/EN eklemek gereksiz.

---

## 12. 30/60/90 gün başarı metrikleri

**30 gün**
- Eski 450 TL / 21 gün / eski adres snippet'leri önemli ölçüde temizlenmiş.
- Sahte/doğrulanmamış yorum iddiaları kaldırılmış.
- Google Business Profile ve Bing doğrulaması canlı.
- Mobil Performance ≥90, LCP ≤2.5 s hedefi.
- AI cevap ölçümü için ilk baseline alınmış.

**60 gün**
- Marka sorgusunda tüm sonuçlar güncel fiyat/üretim bilgisini gösteriyor.
- En az 3–5 ticari/soru sorgusunda ilk 10 görünürlük.
- En az 5 bağımsız üçüncü taraf atıf.
- Ürün → rehber iç linkleri ve kaynakçalar tamam.

**90 gün**
- AI cevaplarında marka adı geçme oranı ve kaynak URL sayısı ölçülüyor.
- “TarhanaTerapi 500 TL” ve “uzun fermantasyon yok” bilgisi AI cevaplarında tutarlı.
- Yorum sayısı gerçek ve API'den geliyor; schema ile görünür içerik uyumlu.
- Organik tıklama ve marka dışı gösterimler artıyor.

---

## Ek — Kanıt özeti

- Canlı sitemap: 13 URL, tamamı 200.
- AI bot testi: 11 bot × 6 sayfa = 66 istek, tamamı 200.
- Agent readiness: Level 3 — Agent-Readable.
- Lighthouse mobil: 78 / 93 / 100 / 92; LCP 4.8 s; toplam 4.53 MB; Material Symbols 4.00 MB.
- `/api/list-reviews?status=approved`: `count: 0`.
- `/BingSiteAuth.xml`: 404.
- `/urunler`: 301 → `/urunler/tarhana-classic`.
- Eski ürün URL'leri: 301 → `/urunler/tarhana-classic`.
- 404: gerçek 404 + `noindex`.
- Arama indeksi: eski 450 TL, 21 gün fermantasyon, kapatılmış ürünler, eski adres/telefon örnekleri görüldü.
- `ruesandora/ruesandora`: yalnızca README; Ruescan canlı değil.

---

**Not:** Bu rapor bir durum tespitidir; kod değişikliği yapılmadı. P0 maddeleri onaylandığında düşük riskli düzeltmeler ayrı bir commit'te uygulanabilir.
