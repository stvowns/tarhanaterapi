# TarhanaTerapi — Yayın, E-posta ve Veri Mimarisi

**Son güncelleme:** 20 Ekim 2026

## 1. Değişiklikler canlıya nasıl çıkıyor?

Şu an kullanılan yöntem **doğrudan Cloudflare Pages yüklemesidir**:

```bash
npm run build
npx wrangler pages deploy dist --project-name tarhanaterapi --branch main --commit-dirty=true
```

- `npm run build` → Vite + `scripts/prerender.ts` çalışır, `dist/` üretilir.
- `wrangler pages deploy dist` → `dist/` içeriği ve `functions/` Cloudflare Pages'e yüklenir.
- Yayın adresi: `https://tarhanaterapi.com` (ve `www` → apex 301).
- Deploy çıktısındaki `*.pages.dev` adresi Türkiye'de DNS engeli nedeniyle açılmayabilir; testler her zaman özel alan adından yapılmalı.

### GitHub durumu

- GitHub deposu: `https://github.com/stvowns/tarhanaterapi`
- Cloudflare Pages projesinde **Git Provider: No** → GitHub bağlı değil.
- Yani `git push` yapmak siteyi **otomatik yayınlamaz**. Canlıya çıkmak için yukarıdaki `wrangler` komutu gerekir.
- 20 Ekim akşamı kargo, yorum, bülten ve animasyon değişiklikleri tamamlandı; canlı yayın `wrangler pages deploy` ile yapılır.

### GitHub'a bağlayıp otomatik deploy istersen

Cloudflare Dashboard → Workers & Pages → `tarhanaterapi` → Settings → Builds & deployments → Connect Git:

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_GOOGLE_CLIENT_ID`
- Functions ve secret'lar (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TELEGRAM_*`) Pages ortamında kalır.

Bağlandıktan sonra `main` dalına push otomatik deploy tetikler. Alternatif olarak mevcut doğrudan `wrangler` akışı korunabilir.

## 2. Sipariş e-postası mekanizması

### Akış sırası

1. **Tarayıcı** → `POST /api/create-order`
   - Müşteri adı, e-posta, telefon, adres, ürünler, KVKK onayı gönderilir.
2. **Cloudflare Pages Function** (`functions/api/create-order.js`)
   - Zorunlu alanları ve KVKK onayını kontrol eder.
   - IP bazlı hız sınırı uygular.
   - Ürün fiyatlarını **sunucuda yeniden hesaplar** (client'tan gelen toplamı kullanmaz).
   - Kargo: 2000 TL üzeri ücretsiz, altı 150 TL.
   - `TT-XXXXXX` sipariş numarası üretir.
3. **Supabase PostgreSQL** (`orders` tablosu)
   - Sipariş, service-role anahtarıyla kalıcı olarak yazılır.
4. **Paralel iki bildirim** (`Promise.allSettled`)
   - **Telegram Bot API** → yönetici sohbetine yeni sipariş özeti.
   - **Resend API** (`POST /emails`) → müşteriye zengin HTML sipariş onay e-postası.
5. **Yanıt**
   - Başarılıysa `{ orderNumber, id }` döner; site sipariş onay ekranını gösterir.
   - E-posta veya Telegram başarısız olsa bile sipariş Supabase'de kayıtlıdır; iki bildirim birbirinden bağımsızdır.

### Hangi altyapı ne için?

| Aşama | Altyapı | Görev |
|---|---|---|
| Site ve API | Cloudflare Pages + Functions | Statik HTML, `/api/*` fonksiyonları, SSL, WAF |
| Sipariş veritabanı | Supabase (PostgreSQL) | `orders`, `order_items`, `subscribers`, `reviews` |
| Otomatik e-posta | Resend | Sipariş onayı, iletişim formu bildirimi |
| Yönetici bildirimi | Telegram Bot API | Yeni sipariş / yorum / iletişim bildirimi |
| Gelen e-posta | Northwest Business Identity | `satis@tarhanaterapi.com` gelen kutusu |
| DNS / SSL / CDN | Cloudflare | Alan adı, MX, SPF, DKIM, DMARC, HSTS |

### Gönderen kimliği ve doğrulama

- Otomatik e-posta gönderen: `TarhanaTerapi <satis@tarhanaterapi.com>`
- Resend domaini: `tarhanaterapi.com` → **verified**
- Resend DKIM: `resend._domainkey.tarhanaterapi.com`
- Resend dönüş yolu: `send.tarhanaterapi.com` → `send.forge.rmta.net` (CNAME)
- DMARC: `v=DMARC1; p=quarantine; rua=mailto:satis@tarhanaterapi.com`
- Kök SPF: `v=spf1 ip4:66.223.49.0/24 ip4:45.88.201.0/24 ~all` → Northwest gelen/manuel gönderim için.
- Resend kendi envelope domain'i ve DKIM'i ile gönderdiği için DMARC **DKIM hizalaması** üzerinden geçer.

### Gelen cevaplar nereye gider?

Müşteri sipariş e-postasına cevap verirse bu mesaj **Northwest mailbox'ına** (`satis@tarhanaterapi.com`) düşer. Resend yalnızca otomatik gönderim içindir; gelen kutusu değildir.

## 3. Ücretsiz e-posta limitleri

### Northwest / Business Identity (domain sağlayıcısı)

Ücretsiz planda:

- **1 gelen kutusu** (`satis@`)
- **250 MB depolama**
- **Günde 100 gönderim**

Bu limitler içinde kalındığı sürece **ücret yansımaz**. Sipariş onayları Resend üzerinden gittiği için Northwest'in 100/gün limiti otomatik sipariş e-postalarını etkilemez; yalnızca webmail'den manuel gönderimler için geçerlidir.

### Resend

**Transactional (otomatik e-posta):**

- **3.000 e-posta/ay**
- **100 e-posta/gün**
- 3 domain, 3 inbox, 30 gün log saklama
- Bu kotaya alıcı başına sayım girer; CC/BCC alıcıları ayrı sayılır.

**Marketing / Broadcast (bülten):**

- **1.000 kişiye kadar ücretsiz**
- Kişi sayısı kadar ücretlendirilir; gönderim sayısı sınırsızdır.
- Broadcast e-postaları transactional 3.000/ay kotasından **düşmez**.
- Free plan: 3 segment, 3 domain, 10.000 automation run.

> Ücret yansımaması için Resend panelinde **Billing → pay-as-you-go/overage kapalı** olmalı. Free plan kredi kartı gerektirmez; limit aşılırsa gönderim durur, otomatik ücret çıkmaz.

## 4. Bülten kayıtları ve yönetici panelinden gönderim

- Kayıtlar: Supabase `subscribers` tablosu.
- Her yeni abone, Resend global kontaktlarına ve `decff556-906f-4dd1-93c1-3009796ab097` segmentine eklenir.
- Yönetici paneli → **E-Posta Listesi** → CSV indirme.
- Yönetici paneli → **Bülten Gönder**:
  - Resend kontaktları listelenir; abonelikten çıkanlar işaretlenemez.
  - Alıcılar tek tek seçilebilir; tek gönderimde en fazla **25 alıcı** desteklenir.
  - Konu, ön yazı, başlık, gövde, öne çıkanlar, buton ve alt not alanları düzenlenebilir.
  - Önizleme iframe içinde gösterilir; gönderim `POST /api/send-newsletter` üzerinden yapılır.
  - E-postalar Resend `/emails` ile ayrı ayrı gönderilir; `List-Unsubscribe` mailto başlığı eklenir.
- Daha büyük toplu gönderimler için Resend → **Broadcasts** → New Broadcast → segment seç → gönder akışı kullanılabilir.
- 1.000 kişiye kadar ücretsiz; üzerinde Resend marketing planı gerekir.
- Alternatif: CSV'yi Brevo'ya aktarıp ücretsiz 300/gün limitiyle göndermek.

## 5. Yorum ve KVKK akışı

- Yorum → `/api/submit-review` → Supabase `reviews` (`verified=false`) + Telegram.
- Yönetici paneli → **Yorumlar** → onay bekleyenleri onayla, yayındaki yorumları sil.
- Onaylı yorumlar `/api/list-reviews?status=approved` üzerinden siteye gelir.
- KVKK metni `/kvkk`, ödeme ekranındaki onay kutusu bu sayfaya bağlıdır.
