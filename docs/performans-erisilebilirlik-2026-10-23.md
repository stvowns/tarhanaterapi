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

## Lighthouse sonucu (yerel, mobil)

`python3 -m http.server` + Lighthouse 13.5, varsayılan mobil throttling:

| Kategori | Skor |
|---|---:|
| Performans | 85 |
| Erişilebilirlik | 100 |
| En İyi Uygulamalar | 96 |
| SEO | 100 |

Ölçülenler:

- Toplam sayfa ağırlığı: **477 KiB** (önceki tam fontlu sürümde yaklaşık
  4,5 MB)
- FCP: 2,6 s
- LCP: 3,7 s
- CLS: 0,002
- TBT: 0 ms

“En İyi Uygulamalar” 96 çıkmasının nedeni yerel önizlemede
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` tanımlı olmamasıdır; canlı
sitede bu hata beklenmez.

## Canlıya çıkışta kontrol listesi

1. `npm run lint`
2. `npm run build`
3. `npx wrangler pages functions build` (import hatası yok)
4. `npm run cf:deploy`
5. Canlıda `Content-Security-Policy` başlığında `fonts.googleapis.com` ve
   `fonts.gstatic.com` olmadığını doğrula.
6. `/fonts/plus-jakarta-sans-normal-400-700-latin-ext.woff2` 200 dönüyor mu?
7. Ana sayfada Material ikonları görünüyor mu? (özellikle sepet, yönetici,
   yorum yıldızları)
8. Yetkisiz `/api/list-orders` isteği 401 dönüyor mu?
9. Mobil Lighthouse'u canlı URL'de tekrar çalıştır.
