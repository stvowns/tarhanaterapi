# Performans ve Erişilebilirlik Paketi — 23 Ekim 2026

## Yapılanlar

### 1. Yazı tipleri artık kendi sunucumuzda

- Playfair Display, Plus Jakarta Sans ve Material Symbols `public/fonts/`
  altında barındırılıyor.
- Material Symbols yalnızca sitede kullanılan **71 ikon** için alt küme
  haline getirildi. Önceki tam font yaklaşık 4 MB idi; yeni dosya yaklaşık
  **12 KB**.
- Google Fonts'a giden `preconnect`, CSS ve font istekleri kaldırıldı.
- CSP `font-src 'self'` olarak sıkılaştırıldı; `style-src` içinden
  `fonts.googleapis.com` çıkarıldı.
- `/fonts/*` için 1 yıl `immutable` cache eklendi.

> Yeni bir Material ikonu eklenirse `public/fonts/material-symbols-outlined.woff2`
> alt kümesinin yeniden üretilmesi gerekir. Aksi halde ikon görünmez.

### 2. Duyarlı görseller

- Hero, malzeme fotoğrafı, ürün görseli ve hikâye görseli için 400w/700w
  WebP varyantları üretildi.
- `srcset`, `sizes`, `width` ve `height` eklendi; böylece mobilde daha küçük
  dosya indirilir ve görsel kaynaklı layout shift azalır.
- Hero için `imagesrcset`/`imagesizes` preload'u eklendi.

### 3. Erişilebilirlik

- `--color-outline` `#8c716b` → `#7a5e58` yapıldı. Küçük metinlerde kontrast
  artık WCAG AA seviyesinin üzerinde.
- İçerik hiyerarşisinde atlanan `h4` başlıkları `h3` yapıldı; dekoratif
  “Pamuk Torbada Tazelik” etiketi paragrafa çevrildi.
- Sepet butonunun erişilebilir adı görünür metni de içerecek şekilde
  `Sipariş ver, sepeti aç` yapıldı.

### 4. Yönetici paneli ve yedek

- Yönetici API'leri artık `app_metadata.role === 'admin'` kontrolünü
  kullanıyor; eski e-posta allowlist'i geçiş için yedekte.
- Panel JSON dışa aktarmasına yorumlar eklendi.
- “Tam Veritabanı Yedeği” ifadesi “Veri Dışa Aktarma (JSON)” olarak
  düzeltildi; auth kullanıcıları, şifreler ve şemanın dahil olmadığı açıkça
  yazıldı.

## Lighthouse sonucu (canlı, mobil)

`https://tarhanaterapi.com/` üzerinde Lighthouse 13.5, varsayılan mobil
throttling, 23 Ekim 2026:

| Kategori | Skor |
|---|---:|
| Performans | 89 |
| Erişilebilirlik | 100 |
| En İyi Uygulamalar | 100 |
| SEO | 100 |

Ölçülenler:

- Toplam sayfa ağırlığı: **597 KiB** (önceki tam fontlu sürümde yaklaşık
  4,5 MB)
- FCP: 2,5 s
- LCP: 3,2 s
- CLS: 0,006
- TBT: 40 ms
- Konsol hatası: **0**

İlk canlı denemede `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` build
sırasında tanımlı olmadığı için uygulama açılışta hata veriyordu. Değerler
git'e girmeyen `.env.local` dosyasına kondu, build tekrarlandı ve canlı
sürüm düzeltildi. Bir daha olmaması için `npm run cf:deploy` artık önce
`npm run check:build-env` çalıştırıyor; eksik değer varsa deploy başlamadan
duruyor.

> `.env.local` **commit edilmemeli**. İçinde yalnızca tarayıcıya açık
> Supabase URL/publishable key ve Google OAuth client ID bulunur; service-role
> anahtarı veya başka bir gizli anahtar bulunmamalı.

## Canlıya çıkışta kontrol listesi

1. `.env.local` içinde `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` ve `VITE_GOOGLE_CLIENT_ID` var mı?
2. `npm run check:build-env`
3. `npm run lint`
4. `npm run build`
5. `npx wrangler pages functions build` (import hatası yok)
6. `npm run cf:deploy` (kontrolü kendisi de çalıştırır)
7. Canlıda `Content-Security-Policy` başlığında `fonts.googleapis.com` ve
   `fonts.gstatic.com` olmadığını doğrula.
8. `/fonts/plus-jakarta-sans-normal-400-700-latin-ext.woff2` 200 dönüyor mu?
9. Ana sayfada Material ikonları görünüyor mu? (özellikle sepet, yönetici,
   yorum yıldızları)
10. Yetkisiz `/api/list-orders` isteği 401 dönüyor mu?
11. Tarayıcı konsolunda hata var mı?
12. Mobil Lighthouse'u canlı URL'de tekrar çalıştır.
