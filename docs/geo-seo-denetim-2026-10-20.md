# GEO / SEO Denetim Raporu

**Tarih:** 20.10.2026 22:35  
**Site:** https://tarhanaterapi.com  
**Kapsam:** 19 prerender URL + robots.txt + llms.txt + PDF + 404 + yönlendirmeler + schema

> **22 Ekim 2026 güncellemesi:** `/urunler` listeleme sayfası kaldırıldı; artık
> `/urunler/tarhana-classic` adresine **301** yönlendiriyor. Aşağıdaki 20 Ekim tablosu
> tarihsel kayıttır; güncel durum `docs/progress-and-security.md` içindedir.

## Özet

- Sitemap: **HTTP 200**, **19 URL**
- HTTP 200: **19/19**
- Canonical doğru: **19/19**
- Tek H1: **19/19**
- JSON-LD geçerli: **19/19**
- robots.txt AI botlarına açık: **True**
- llms.txt: **HTTP 200**, llms-full.txt: **HTTP 200**
- PDF: **HTTP 200**, 2.3 MB
- Bilinmeyen yol (soft-404): **HTTP 404**
- `http://` → HTTPS: **200**, `www` → apex: **200**
- HSTS: **var**
- OG görseli: **HTTP 200** (110017 bayt)
- Ürün schema: fiyat **450.00 TL**, kargo **150.00 TL**

## Sayfa sayfa

| URL | HTTP | Title | Desc | Canonical | H1 | JSON-LD |
|---|---:|---:|---:|---|---:|---|
| `/` | 200 | 63 | 134 | ✅ | 1 | Answer,ContactPoint,Country,FAQPage,ImageObject,ItemList,ListItem,Open |
| `/urunler` | 200 | 45 | 147 | ✅ | 1 | BreadcrumbList,CollectionPage,ContactPoint,Country,ImageObject,ItemLis |
| `/icerik` | 200 | 53 | 147 | ✅ | 1 | BreadcrumbList,ContactPoint,Country,ImageObject,ListItem,Organization, |
| `/hikaye` | 200 | 60 | 143 | ✅ | 1 | AboutPage,BreadcrumbList,ContactPoint,Country,ImageObject,ListItem,Org |
| `/yorumlar` | 200 | 47 | 133 | ✅ | 1 | BreadcrumbList,ContactPoint,Country,ImageObject,ListItem,Organization, |
| `/iletisim` | 200 | 45 | 145 | ✅ | 1 | Answer,BreadcrumbList,ContactPage,ContactPoint,Country,FAQPage,ImageOb |
| `/kvkk` | 200 | 37 | 128 | ✅ | 1 | BreadcrumbList,ContactPoint,Country,ImageObject,ListItem,Organization, |
| `/urunler/tarhana-classic` | 200 | 58 | 145 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/urunler/tarhana-spicy` | 200 | 45 | 136 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/urunler/tarhana-baby` | 200 | 56 | 153 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/urunler/tarhana-starter-set` | 200 | 53 | 119 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/urunler/tarhana-family-pack` | 200 | 62 | 126 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/urunler/tarhana-gourmet-duo` | 200 | 65 | 125 | ✅ | 1 | Brand,BreadcrumbList,ContactPoint,Country,DefinedRegion,ImageObject,Li |
| `/rehber` | 200 | 58 | 132 | ✅ | 1 | BreadcrumbList,CollectionPage,ContactPoint,Country,ImageObject,ItemLis |
| `/rehber/tarhana-nasil-kurutulur` | 200 | 64 | 149 | ✅ | 1 | Answer,Article,BreadcrumbList,ContactPoint,Country,FAQPage,ImageObject |
| `/rehber/bebeklere-tarhana-ne-zaman-verilir` | 200 | 64 | 154 | ✅ | 1 | Answer,Article,BreadcrumbList,ContactPoint,Country,FAQPage,ImageObject |
| `/rehber/tarhana-neden-eksir` | 200 | 60 | 136 | ✅ | 1 | Answer,Article,BreadcrumbList,ContactPoint,Country,FAQPage,ImageObject |
| `/rehber/ev-tarhanasi-ile-hazir-tarhana-farki` | 200 | 62 | 150 | ✅ | 1 | Answer,Article,BreadcrumbList,ContactPoint,Country,FAQPage,ImageObject |
| `/rehber/katkisiz-tarhana-nasil-anlasilir` | 200 | 62 | 156 | ✅ | 1 | Answer,Article,BreadcrumbList,ContactPoint,Country,FAQPage,ImageObject |

## AI bot erişimi

- Canlı test: **11 bot × 6 sayfa = 66 istek**, tamamı HTTP 200, challenge yok.
- robots.txt’de açıkça izin verilenler: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Googlebot, Bingbot, Applebot, CCBot, Amazonbot, meta-externalagent, MistralAI-User
- Cloudflare yönetimli robots.txt enjeksiyonu tespit edilmedi (`Content-Signal` / `Disallow: /` yok).

## Uyarılar / öneriler

- Title, description, canonical, H1 ve JSON-LD kontrollerinde kritik sorun yok.
- Bing doğrulama dosyası (`/BingSiteAuth.xml`) 404; panelde GSC içe aktarma ile doğrulama kullanılıyorsa sorun değil, değilse Bing Webmaster’dan doğrulama tamamlanmalı.
- Cloudflare AI Crawl Control ayarları API token yetkisi olmadığı için okunamadı; canlı davranış açık. Panelde Search/Agent/Training = Allow önerilir (Training block, Googlebot/Bingbot’u da etkileyebilir).
- Cloudflare Web Analytics’in kullanıcı tarafından Pages → Metrics üzerinden etkinleştirilmesi gerekiyor.

## Teknik notlar

- HSTS: `max-age=31536000; includeSubDomains`
- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ve Permissions-Policy aktif.
- Tüm sayfalarda `lang="tr"`, canonical, hreflang tr + x-default mevcut.
- Ürün sayfalarında Product + Offer + OfferShippingDetails + BreadcrumbList; rehberlerde Article + FAQPage + BreadcrumbList var.
- Yorum `AggregateRating` bilinçli olarak yok (doğrulanmamış puanlarla zengin sonuç riski alınmıyor).
