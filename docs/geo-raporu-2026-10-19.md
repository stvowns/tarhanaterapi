# TarhanaTerapi — GEO / AI Görünürlük Raporu

**Tarih:** 19 Ekim 2026
**Site:** https://tarhanaterapi.netlify.app
**Kapsam:** Teknik GEO, AI bot erişimi, entity/schema, alıntılanabilir içerik, ölçüm planı
**Durum:** Teknik değişiklikler canlıya alındı (production deploy tamamlandı)

> **22 Ekim 2026 güncellemesi:** Site artık Cloudflare Pages üzerinde ve `/urunler`
> listeleme sayfası kaldırıldı; `/urunler` → `/urunler/tarhana-classic` **301**.
> Bu rapor 19 Ekim tarihli tarihsel kayıttır.

---

## 1. Kısa özet

Site, AI arama motorlarının (ChatGPT Search, Perplexity, Gemini/Google AI Overviews, Copilot/Bing) **sayfayı okuyabildiği** ama **alıntılanabilir içerik ve marka otoritesi** açısından zayıf olduğu bir noktadaydı. En büyük teknik sorun, sitenin tamamen istemci tarafında render edilen bir React SPA olmasıydı: botlar HTML kaynağında yalnızca boş bir `<div id="root"></div>` görüyordu.

Bu raporda listelenen değişikliklerle:

- Site **18 statik URL** olarak prerender edildi (6 ana sayfa + 6 ürün + 6 rehber).
- Her sayfaya **kendi title, description, canonical, OG etiketi ve JSON-LD grafı** verildi.
- Ürünler ve rehberler için **gerçek URL'ler** açıldı.
- Ana sayfaya **marka tanım cümlesi**, **10 soruluk SSS** ve **son güncelleme tarihi** eklendi.
- `llms.txt`, `llms-full.txt`, `robots.txt` ve `sitemap.xml` AI botlarına göre yeniden yazıldı.
- Görseller yerelleştirildi, cache ve güvenlik başlıkları düzeltildi.

**Ölçülen sonuç (Lighthouse, mobil, canlı site):**

| Metrik | Sonuç |
|---|---:|
| Performance | **97 / 100** |
| SEO | **100 / 100** |
| Best Practices | **100 / 100** |
| Accessibility | **93 / 100** |
| LCP | **2,1 s** |
| CLS | **0,015** |
| TBT | **30 ms** |

> Not: Bu skorlar teknik temeli gösterir. AI cevaplarında **anılma garantisi değildir**. Anılma; indexlenme + alıntılanabilir içerik + marka mention'ları + gerçek yorumlar + tutarlı NAP bilgisinin birleşimidir. Ölçüm planı Bölüm 8'dedir.

---

## 2. Başlangıçta tespit edilen sorunlar

### Kritik (satışı doğrudan etkileyen)

1. **Canonical adres ölü bir alan adını gösteriyordu.**
   Tüm canonical, sitemap ve JSON-LD adresleri `https://tarhanaterapi.com/` idi. Ancak 19 Ekim 2026 itibarıyla bu alan adı ne HTTP ne HTTPS ile açılıyor, MX kaydı da yok. Yani Google'a "asıl sayfam burada" denirken çalışmayan bir adres gösteriliyordu.
   **Çözüm:** Canonical adres canlı Netlify adresine çevrildi. `VITE_SITE_URL` ortam değişkeniyle tek satırdan özel alan adına geçilebilir.

2. **HTML kaynağında içerik yoktu.**
   Ürün adı, fiyat, içindekiler ve SSS yalnızca JavaScript çalıştıktan sonra oluşuyordu. GPTBot, ClaudeBot, PerplexityBot gibi botların bir kısmı JS çalıştırmaz; bu durumda sayfa boş görünür.
   **Çözüm:** Her rota build sırasında statik HTML'e yazıldı.

3. **Ürünlerin ve rehberlerin URL'si yoktu.**
   Ürünler modal içinde açılıyordu. AI'ın "bebek tarhanası fiyatı" sorusuna vereceği cevapta işaret edebileceği bir ürün sayfası yoktu.
   **Çözüm:** `/urunler/<urun>` ve `/rehber/<konu>` URL'leri açıldı.

4. **İletişim e-postasının domaini çalışmıyor.**
   `sifa@tarhanaterapi.com` adresi sitede müşteri iletişimi olarak veriliyor; ancak `tarhanaterapi.com` için MX kaydı yok. E-postaların geri dönme riski yüksek.
   **Çözüm:** Kod tarafında yapılamaz. Bölüm 6, madde 2.

5. **Fiyat ve gramaj yapısı (19 Ekim 2026'da güncellendi).**
   Eski veride 500 g klasik tarhana **450 TL**, 1000 g aile paketi **330 TL** görünüyordu; 1000 g ürün 500 g'dan ucuzdu. Ayrıca 500 g seçeneği minimum sepeti düşürüyordu.
   **Yeni yapı (minimum 1 kg):** 1 kg klasik **450 TL**, 1 kg acılı **500 TL**, 1 kg bebek **500 TL**, 1 kg pamuk çuvallı aile paketi **450 TL**, 2×1 kg ikili gurme paketi **900 TL**, 1 kg tarhana içeren başlangıç seti **850 TL**. 500 g seçeneği tamamen kaldırıldı. **2000 TL** üzeri siparişlerde kargo ücretsiz; altında standart kargo **150 TL**. Tüm ürün sayfaları, schema, `llms.txt`, `llms-full.txt`, ana sayfa tablosu ve SSS bu yapıyla güncellendi.

### Orta (AI görünürlüğünü sınırlayan)

6. Meta description iki kez tanımlıydı; biri 86 karakterdi.
7. `og:image` yoktu; paylaşımlar görselsiz görünüyordu.
8. Organization schema yalnızca 5 alandı; `sameAs`, `contactPoint`, `Store`, çalışma saatleri yoktu.
9. FAQPage, Product, Article, BreadcrumbList schema'ları yoktu.
10. Sayfada markayı tanımlayan tek cümle yoktu ("TarhanaTerapi nedir?" sorusuna AI'ın alıntılayacağı cümle).
11. İçerikte tarih yoktu; AI tazelik sinyali göremiyordu.
12. CSS/JS için uzun cache yoktu; her ziyarette yeniden indiriliyordu.
13. Görseller üçüncü taraf `lh3.googleusercontent.com` adresinden geliyordu.
14. `llms.txt` kısaydı, `llms-full.txt` yoktu; sitemap 6 URL'ydi.
15. SSS, ürün ve rehber içerikleri AI'ın alıntılayacağı soru-cevap formatında değildi.

### Güven / uyum riskleri (teknik değil, ama GEO'yu etkiler)

16. Ürün kartlarında "420+ değerlendirme", "310 değerlendirme" gibi sayılar var. Bunlar gerçek değilse yanıltıcı olur; schema'ya **bilinçli olarak AggregateRating eklenmedi**.
17. "%100 organik" ifadesi sertifika numarası olmadan kullanılıyor. Türkiye'de "organik" kullanımı sertifikasyon gerektirir.
18. "Terapi", "şifa", "şifalı" gibi sağlık çağrışımlı ifadeler gıda için risklidir. AI motorları da bu tür iddiaları güven sinyali olarak kullanmaz.
19. Yasal metinler (gizlilik, mesafeli satış, KVKK) ayrı URL değil, modal içinde. AI ve kullanıcı için taranabilir sayfa olmaları gerekir.

---

## 3. Yapılan değişiklikler

### 3.1. Statik prerender (en yüksek etki)

`scripts/prerender.ts` eklendi. `npm run build` artık önce Vite build, sonra prerender çalıştırıyor.

Üretilen dosyalar:

```
dist/index.html
dist/urunler.html
dist/urunler/tarhana-classic.html
dist/urunler/tarhana-spicy.html
dist/urunler/tarhana-baby.html
dist/urunler/tarhana-starter-set.html
dist/urunler/tarhana-family-pack.html
dist/urunler/tarhana-gourmet-duo.html
dist/icerik.html
dist/hikaye.html
dist/yorumlar.html
dist/iletisim.html
dist/rehber.html
dist/rehber/tarhana-nasil-kurutulur.html
dist/rehber/bebeklere-tarhana-ne-zaman-verilir.html
dist/rehber/tarhana-neden-eksir.html
dist/rehber/ev-tarhanasi-ile-hazir-tarhana-farki.html
dist/rehber/katkisiz-tarhana-nasil-anlasilir.html
dist/sitemap.xml
```

Netlify'da her rota için rewrite tanımlandı. Örnek:

```
/urunler/tarhana-baby  →  /urunler/tarhana-baby.html  (200)
/rehber/tarhana-neden-eksir  →  /rehber/tarhana-neden-eksir.html  (200)
```

Sonuç: JavaScript çalıştırmayan botlar da ürün adını, fiyatı, içindekileri, SSS'yi ve JSON-LD'yi görüyor. Kullanıcı tarafında React aynı URL'de devreye giriyor; görsel deneyim bozulmuyor.

### 3.2. Yeni sayfalar

- **6 ürün sayfası:** H1, tanım cümlesi, fiyat, içindekiler, 100 g besin tablosu, alerjen uyarısı, kargo/saklama/iade, 3 SSS, ilgili ürünler.
- **Minimum 1 kg:** 500 g ürün seçenekleri kaldırıldı. Klasik, acılı ve bebek 1 kg; aile paketi 1 kg; ikili paket 2×1 kg; başlangıç seti 1 kg tarhana + kase/kaşık olarak satılıyor.
- **5 rehber:** AI'ın en çok alıntıladığı soru kümeleri:
  - Tarhana nasıl kurutulur?
  - Bebeklere tarhana ne zaman verilir?
  - Tarhana neden ekşir?
  - Ev tarhanası ile hazır tarhana farkı
  - Katkısız tarhana nasıl anlaşılır?
- **Rehber indeksi:** `/rehber`

Her rehberde yayın/güncelleme tarihi, yazar (TarhanaTerapi), SSS, ilgili ürün bağlantıları ve diğer rehberlere iç link var.

### 3.3. Ana sayfa içeriği

- H1'in hemen altına marka tanım cümlesi eklendi:
  > "TarhanaTerapi, Bursa Orhangazi'de üç nesilden devraldığı mayayla ata tohumu koçbaşı nohutlu, katkısız anne tarhanasını toprak küplerde 21 gün fermente ederek üreten bir aile işletmesidir."
- `id="sss"` ile 10 soruluk SSS bölümü eklendi.
- "Son güncelleme: 19 Ekim 2026" bilgisi SSS ve footer'a eklendi.
- Ürün kartlarından ürün sayfalarına crawlable `<a>` linkleri eklendi.
- Header ve footer menüleri `<button>` yerine gerçek `<a href>` linklerine çevrildi.

### 3.4. Metadata ve paylaşım

- Tek ve 147 karakterlik meta description.
- Her rota için benzersiz title/description.
- Canonical: canlı Netlify adresi.
- `hreflang="tr"` ve `x-default`.
- 1200×630 `og-image.jpg` üretildi (marka, ürün, fiyat, iletişim).
- `og:image`, `og:image:width/height/alt`, `twitter:image` eklendi.
- Ürün sayfalarında `og:type=product`.
- `theme-color`, `author`, `publisher`, `max-snippet:-1` eklendi.

### 3.5. JSON-LD (schema.org)

Tek bir `@graph` içinde, sayfaya göre:

| Sayfa | Schema tipleri |
|---|---|
| Ana sayfa | Organization, WebSite, Store, WebPage, ItemList, FAQPage |
| Ürünler | Organization, WebSite, CollectionPage, ItemList, BreadcrumbList |
| Ürün | Organization, WebSite, ProductPage, Product + Offer, BreadcrumbList |
| Rehber | Organization, WebSite, Article, FAQPage, BreadcrumbList |
| İletişim | Organization, WebSite, ContactPage, Store, FAQPage |

Öne çıkanlar:

- `Organization`: ad, alternatif ad, logo, adres, telefon, e-posta, `contactPoint`, `sameAs` (Instagram), `knowsAbout`.
- `Store`: `priceRange`, para birimi, ödeme yöntemleri, çalışma saatleri, adres.
- `Product`: SKU, marka, üretici, net miktar, menşe, `Offer` (fiyat, TRY, stok, `priceValidUntil`, kargo detayı).
- `FAQPage`: Sayfadaki SSS metniyle **birebir** aynı.
- `BreadcrumbList`: Tüm alt sayfalarda.
- `Article`: Rehberlerde `datePublished`, `dateModified`, yazar, yayıncı.

**Bilinçli olarak eklenmeyen:** `AggregateRating`. Yorumlar gerçek ve doğrulanabilir olmadan rating schema eklemek Google politikalarına aykırıdır. Gerçek yorum altyapısı bağlanınca eklenmeli.

### 3.6. AI bot erişimi

`public/robots.txt` içinde açıkça izin verilen botlar:

`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Googlebot`, `Googlebot-Image`, `Bingbot`, `Applebot`, `Applebot-Extended`, `Amazonbot`, `meta-externalagent`, `MistralAI-User`, `CCBot`.

Canlı doğrulama: Aynı ürün sayfası GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot ve Googlebot user-agent'larıyla istendi; **hepsi aynı H1 ve fiyat metnini** gördü.

### 3.7. llms.txt ve llms-full.txt

- `/llms.txt`: marka tanımı, kısa cevaplar, fiyatlar, kargo, alerjen, ürün ve rehber linkleri.
- `/llms-full.txt`: ürün tablosu, içindekiler, üretim süreci, 10 SSS, iade/KVKK özeti, AI kullanım notu.

Her iki dosyadaki linkler canlıda 200 dönüyor.

### 3.8. Sitemap ve indeksleme

- Sitemap 6 URL'den **18 URL'ye** çıktı; ürün ve rehberler dahil.
- Her URL'de gerçek `lastmod` (2026-10-19), `changefreq`, `priority`.
- Build sırasında sitemap otomatik üretiliyor; elle güncelleme gerekmiyor.

**IndexNow:** `scripts/indexnow.ts` eklendi ve ilk gönderim yapıldı (HTTP 202). Anahtar dosyası canlıda:
`https://tarhanaterapi.netlify.app/11b92a56bf582414420a4ab1735edb24.txt`
Her yeni deploy'dan sonra `npm run indexnow` çalıştırıldığında 18 URL Bing, Yandex, Seznam ve Naver'a bildirilir. Bu, özellikle **Copilot/Bing** görünürlüğü için önemlidir.

### 3.9. Hız, cache ve güvenlik

- 7 görsel `public/images/*.webp` olarak yerelleştirildi (toplam ~230 KB). Üçüncü taraf görsel bağımlılığı kalktı.
- Hero görseli `preload` + `fetchpriority="high"`, `width`/`height` verildi.
- `/assets/*`: `Cache-Control: public, max-age=31536000, immutable`
- `/images/*`: 30 gün cache.
- HTML: `max-age=0, must-revalidate`.
- `Permissions-Policy` eklendi; CSP, HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy` korundu.

**Önce/sonra:**

| | Önce | Sonra |
|---|---|---|
| Mobil Performance | ölçülmedi (Ruescan: LCP 1,9 s) | **97** |
| LCP | 1,9 s (Ruescan) | **2,1 s** (Lighthouse, soğuk cache) |
| CLS | 0,01 | **0,015** |
| SEO | — | **100** |
| Statik URL | 1 (SPA) | **18** |
| Schema tipi | 1 (Organization) | **11 farklı tip** |
| Sitemap URL | 6 | **18** |

> Lighthouse farkı: Ruescan farklı bir ölçüm profili kullanıyor. Asıl önemli olan, içeriğin artık HTML kaynağında olması ve görsellerin yerel olması.

---

## 4. Canlı doğrulama

Aşağıdaki komutlar 19 Ekim 2026'da çalıştırıldı.

```bash
# Ana sayfa ve rota durumları
for p in / /urunler /urunler/tarhana-baby /rehber /rehber/tarhana-neden-eksir; do
  curl -s -o /dev/null -w "$p %{http_code}\n" "https://tarhanaterapi.netlify.app$p"
done

# AI botları aynı içeriği görüyor mu?
for ua in GPTBot OAI-SearchBot ClaudeBot PerplexityBot Googlebot; do
  echo -n "$ua: "
  curl -s -A "$ua" https://tarhanaterapi.netlify.app/urunler/tarhana-classic \
    | grep -o '<h1>[^<]*' | head -1
done

# Canonical ve title
curl -s https://tarhanaterapi.netlify.app/ \
  | grep -o '<title>[^<]*\|rel="canonical"[^>]*'

# Robots, llms, sitemap
curl -s https://tarhanaterapi.netlify.app/robots.txt | head
curl -s https://tarhanaterapi.netlify.app/llms.txt | head
curl -s https://tarhanaterapi.netlify.app/sitemap.xml | grep -c '<url>'

# Cache
curl -sI https://tarhanaterapi.netlify.app/assets/<dosya>.js | grep -i cache-control
```

Beklenen:

- Tüm rotalar `200`.
- Bot user-agent'larında aynı H1.
- `x-robots-tag: noindex` **yok** (draft deploy'da vardı, production'da yok).
- Asset cache `immutable`.

---

## 5. AI motorları bu değişiklikten nasıl etkilenir?

| Motor | Kullandığı bot | Bu değişiklikten sonra |
|---|---|---|
| ChatGPT Search | `OAI-SearchBot`, `GPTBot` | Sayfa HTML'inde ürün, fiyat ve SSS görünüyor. |
| Perplexity | `PerplexityBot`, `Perplexity-User` | Kaynak olarak gösterilebilecek 18 URL var. |
| Google AI Overviews / AI Mode | `Googlebot`, `Google-Extended` | Indexlenebilir, schema'lı, hızlı sayfalar. |
| Gemini | Google Search grounding | Aynı index ve schema altyapısı. |
| Copilot / Bing | `Bingbot` | Sitemap ve temiz HTML; Bing Webmaster'a gönderim gerekli. |
| Claude | `ClaudeBot`, `Claude-SearchBot` | Erişim açık, içerik okunabilir. |

**Önemli sınır:** Botun sayfayı okuyabilmesi, AI'ın o markayı **önerECEĞİ** anlamına gelmez. AI cevabı; sorgu niyeti, kaynak güvenilirliği, marka mention'ları, yorumlar ve rakip kaynakların durumuna göre seçilir. Bu yüzden Bölüm 6 ve 7'deki off-site işler şart.

---

## 6. Kalan kritik işler (öncelik sırasıyla)

### P0 — Bu hafta

1. **Alan adını ve HTTPS'i düzeltin.**
   `tarhanaterapi.com` şu anda ne HTTP ne HTTPS ile açılıyor. Bu domain markanın adı; AI ve kullanıcı güveni için canlı olmalı.
   - DNS A/CNAME kaydını Netlify'a yönlendirin.
   - Netlify'da custom domain + Let's Encrypt sertifikası ekleyin.
   - Netlify `VITE_SITE_URL=https://tarhanaterapi.com` yapıp yeniden deploy edin.
   - Canonical, sitemap ve JSON-LD otomatik olarak yeni adrese geçer.
   - Netlify alt alan adını 301 ile `.com`'a yönlendirin.

2. **E-posta teslimini doğrulayın.**
   `tarhanaterapi.com` için MX kaydı yok. `sifa@tarhanaterapi.com` adresine mail gitmiyorsa:
   - Google Workspace / Yandex Mail / Zoho kurun, veya
   - sitede gerçekten çalışan bir adres yayınlayın.
   Müşteri e-postasına cevap gelmemesi, GEO'dan bağımsız olarak satışı öldürür.

3. **Fiyatları ödeme altyapısıyla karşılaştırın.** ✅ Site fiyatları güncellendi (minimum 1 kg; klasik 1 kg 450 TL; 2000 TL üzeri kargo ücretsiz). Şimdi PayTR/iyzico/Stripe panelindeki ve pazaryerlerindeki fiyatların aynı olduğunu doğrulayın; farklıysa müşteri ödeme adımında şaşırır.

4. **Gerçek yorumları bağlayın veya sahte sayıları kaldırın.**
   "420+ değerlendirme" gerçek değilse kaldırın. Gerçek yorumlar geldiğinde `AggregateRating` schema'sı eklenebilir. Sahte yorum, Google ve Ticaret Bakanlığı açısından risklidir.

5. **Google Search Console + Bing Webmaster Tools.**
   - `https://tarhanaterapi.netlify.app/sitemap.xml` gönderin.
   - IndexNow ilk gönderimi yapıldı (18 URL, HTTP 202). Bundan sonra her deploy'da `npm run indexnow` çalıştırın.
   - 48 saat içinde `site:tarhanaterapi.netlify.app` kontrol edin.

### P1 — 2 hafta içinde

6. **DMARC / SPF / DKIM.**
   Domain canlandıktan sonra:
   ```
   _dmarc.tarhanaterapi.com  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@tarhanaterapi.com; adkim=s; aspf=s; pct=100"
   ```
   Önce SPF ve DKIM'i kurun, sonra `p=quarantine` → `p=reject`.
   Doğrulama: `dig +short TXT _dmarc.tarhanaterapi.com`

7. **Google Business Profile (Orhangazi).**
   - Kategori: Yöresel gıda / gıda üreticisi.
   - Adres: Gedelek Köyü Mevkii No: 28, Orhangazi / Bursa.
   - Telefon, web, çalışma saatleri siteyle **birebir** aynı.
   - Üretim, kurutma, kargo fotoğrafları.
   - Gelen yorumlara aynı gün cevap.
   Bu, "Orhangazi tarhana" ve "Bursa ev tarhanası" sorgularında AI'ın yerel kaynak olarak görmesi için en güçlü adım.

8. **Yerel mention'lar (5-8 adet).**
   - Orhangazi Gazetesi, Orhangazi Hayat, Bursa yerel haber siteleri.
   - Orhangazi Belediyesi / kadın kooperatifi / esnaf odası üretici listeleri.
   - Bursa Uludağ Üniversitesi gastronomi topluluğu.
   - "Kış hazırlığı" dosyalarına uzman görüşü; reklam değil, bilgi.
   Link istemeyin; **doğru bilgi ve isim** bırakın. Link kendiliğinden gelir.

9. **Tarif/anne sitelerine düzeltme maili.**
   AI'ın en çok cite ettiği "tarhana nasıl kurutulur", "bebek tarhanası" yazılarını bulun. Yanlış veya eksik bilgi varsa üretici olarak kibar bir düzeltme gönderin. Link değil, doğruluk talep edin.

### P2 — 30-90 gün

10. **İçerik takvimi (haftada 1 rehber).**
    Mevcut 5 rehbere eklenebilecekler:
    - Tarhana çorbası tarifi (ölçülü, adım adım) + `Recipe` schema
    - Tarhana fiyatları 2026: neye göre değişir?
    - Glutensiz tarhana var mı, çölyak için alternatifler
    - Tarhana ile yapılan 10 yemek
    - Bebek tarhanası seçerken 7 kontrol
    - Orhangazi'de tarhana üretimi: hasat ve kurutma günlüğü
    Her yazıda yazar, tarih, kaynak ve ürün bağlantısı olsun.

11. **Video ve görsel içerik.**
    60 saniyelik kurutma/paketleme videosu (Reels, TikTok, Shorts, YouTube). YouTube açıklaması AI tarafından okunur. Siteye `VideoObject` schema eklenebilir.

12. **Pazaryeri + kendi site.**
    Trendyol/Hepsiburada mağazası açıyorsanız, pakete `üretici kartı + QR` koyun. Pazaryeri hacmi, kendi sitenizde marka aramasını ve AI mention'ını besler.

13. **Yasal sayfaları URL'ye taşıyın.**
    `/gizlilik-politikasi`, `/mesafeli-satis`, `/kvkk-aydinlatma`. AI ve kullanıcı için taranabilir, tarihli, iletişim bilgili sayfalar olsun.

14. **İngilizce faz (opsiyonel).**
    Gurbetçi pazarı için `/en/` + `hreflang`. Önce Türkçe'de 15-20 mention'a ulaşın.

---

## 7. 30 / 60 / 90 gün planı

| Dönem | Hedef | Ana işler | Başarı kriteri |
|---|---|---|---|
| 0-30 gün | Teknik temel + yerel görünürlük | Domain/HTTPS/e-posta, GSC + Bing, GBP, DMARC, gerçek yorumlar, fiyat doğrulaması | 18 URL indexli, GBP yayında, 3+ yerel mention |
| 31-60 gün | Alıntılanabilir içerik | 4 yeni rehber, 10 düzeltme maili, 5 yerel mention, video | 10+ rehber/ürün URL'si AI cevaplarında kaynak |
| 61-90 gün | Otorite + ölçüm | 2 guest içerik, diyetisyen onaylı bebek içeriği, aylık AI ölçümü | 12 sorudan 4+'ında anılma, %10+ AI trafiği |

**Yapılmaması gerekenler:** toplu dizin kaydı, PBN, yorum spam'i, paralı gizli link, her şehir için kopyala-yapıştır sayfa, AI'a "bizi öner" diye yazdırma. Bunlar kısa vadede görünürlük değil, ceza getirir.

---

## 8. AI görünürlük ölçümü (haftalık)

Her pazartesi, **gizli sekme / fresh chat** ile 12 soruyu ChatGPT, Gemini, Perplexity ve Copilot'ta sorun. Konum: Türkiye. Sonuçları aşağıdaki tabloya işleyin.

**Sabit sorular:**

1. En iyi ev yapımı tarhana hangisi?
2. Katkısız tarhana nereden alınır?
3. Bebekler için hangi tarhana markası güvenilir?
4. Orhangazi'de tarhana satan yerler
5. Bursa'dan ev tarhanası kargo ile alınır mı?
6. Tarhana fiyatları 2026 ne kadar?
7. Tarhana nasıl kurutulur?
8. Tarhana neden ekşir?
9. Bebeklere tarhana ne zaman verilir?
10. Ev tarhanası ile hazır tarhana arasındaki fark
11. TarhanaTerapi güvenilir mi?
12. Glutensiz tarhana var mı?

| Hafta | Soru | Motor | Anıldı mı? | Kaçıncı sırada? | Tanım doğru mu? | Site cite edildi mi? | Hangi rakipler cite edildi? |
|---|---|---|---|---|---|---|---|
| W43 | Bebeklere tarhana ne zaman verilir? | ChatGPT | | | | | |
| W43 | Katkısız tarhana nereden alınır? | Perplexity | | | | | |
| W43 | Tarhana fiyatları 2026 | Gemini | | | | | |
| W43 | Orhangazi tarhana | Copilot | | | | | |

**Takip edilecek 3 sayı:**

1. **Anılma oranı:** 12 sorudan kaçında marka geçti?
2. **Doğru tanım oranı:** Geçtiğinde fiyat/üretim/konum doğru mu?
3. **Cite edilen URL sayısı:** Hangi sayfalar kaynak gösterildi?

Ek olarak Search Console'dan gösterim, tıklama, ortalama sıra; Bing Webmaster'dan AI Performance / grounding queries; GA4'ten AI referrer'ları (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`) izleyin.

> İlk 2 hafta anılma düşük olabilir. Önemli olan trend. İçerik ve mention arttıkça 60-90 günde anılma yükselir.

---

## 9. Değişen / eklenen dosyalar

| Dosya | Ne yapıldı |
|---|---|
| `scripts/prerender.ts` | 18 statik sayfa + sitemap üretimi |
| `scripts/indexnow.ts` | IndexNow bildirimi (18 URL) |
| `src/lib/site.ts` | Site sabitleri, rota SEO'su, tüm JSON-LD grafları |
| `src/App.tsx` | Ürün ve rehber rotaları, sayfa bazlı SEO/schema, SSS bölümü |
| `src/components/SeoHead.tsx` | Title/description/canonical/OG/schema güncellemesi |
| `src/pages/ProductPage.tsx` | Ürün detay sayfası |
| `src/pages/GuidePage.tsx`, `GuidesPage.tsx` | Rehber sayfaları |
| `src/data/guides.ts` | 5 rehberin içeriği |
| `src/components/FaqSection.tsx` | Ana sayfa SSS bloğu |
| `src/components/Hero.tsx` | Marka tanım cümlesi, görsel boyutları |
| `src/components/Header.tsx`, `Footer.tsx` | Crawlable linkler, güncelleme tarihi, rehber linki |
| `src/components/ProductsSection.tsx`, `src/pages/ProductsPage.tsx` | Ürün sayfası linkleri |
| `src/data/mockData.ts` | Yerel görseller, genişletilmiş SSS |
| `src/data/legal.ts` | Site adresi düzeltmesi |
| `index.html` | Temiz head, OG, hreflang, statik fallback, schema |
| `public/robots.txt` | AI botlarına açık erişim |
| `public/llms.txt`, `public/llms-full.txt` | AI kaynak dosyaları |
| `public/sitemap.xml` | 18 URL |
| `public/images/*.webp`, `public/og-image.jpg` | Yerel görseller |
| `netlify.toml` | Rota rewrite'ları, cache ve güvenlik başlıkları |
| `vercel.json` | Aynı rota/cache kurallarının Vercel karşılığı |
| `public/11b92a…txt` | IndexNow anahtar dosyası |
| `public/_redirects` | Kaldırıldı (netlify.toml ile çakışmayı önlemek için) |
| `package.json` | Build'e prerender + IndexNow komutları |
| `.env.example` | Canonical adres notu |

---

## 10. Sonuç ve beklenti

Bu çalışma, sitenin **AI tarafından okunabilir** hale gelmesini sağladı. Önceki durumda botlar boş HTML görüyordu; şimdi ürün, fiyat, içerik ve SSS statik olarak okunabiliyor. Bu, GEO'nun **ön koşulu** ve en teknik kısmıydı.

Ancak AI cevaplarında görünmek için sıradaki iş **teknik değil, otorite**:

1. Çalışan alan adı ve e-posta,
2. Gerçek yorumlar,
3. Google Business Profile,
4. Yerel ve sektörel mention'lar,
5. Düzenli, tarihli, alıntılanabilir içerik.

Bunlar tamamlandığında "Orhangazi tarhanası", "katkısız tarhana", "bebek tarhanası" ve "tarhana nasıl kurutulur" gibi sorgularda AI cevaplarında kaynak olma şansı ciddi biçimde artar. Tek başına schema veya llms.txt sihir değildir; ama doğru içerik ve mention'larla birleştiğinde en güçlü teknik altyapıdır.

**Not:** Kaynak kodu değişiklikleri henüz git'e commit edilmedi. Bir sonraki otomatik Netlify build'inin de aynı çıktıyı üretmesi için commit + push önerilir.
