# Admin Yetkisi, MFA ve Yedekleme — 23 Ekim 2026

## 1. Yönetici yetkisi artık rol tabanlı

Sunucu tarafındaki tüm yönetici API'leri artık önce Supabase
`app_metadata.role === 'admin'` kontrolünü yapar. Eski e-posta allowlist'i
(`layeredstudio78@gmail.com`) yalnızca geçiş dönemi için yedek olarak durur.

İlgili dosyalar:

- `functions/_lib/admin.js` — ortak yetki kontrolü
- `src/lib/admin.ts` — panel görünürlüğü için aynı kural
- `functions/api/list-orders.js`, `update-order-status.js`, `list-reviews.js`,
  `moderate-review.js`, `list-subscribers.js`, `list-newsletter-contacts.js`,
  `send-newsletter.js`

### Rol nasıl atanır?

Supabase panelinde:

1. **Authentication → Users** bölümüne gir.
2. `layeredstudio78@gmail.com` kullanıcısını aç.
3. **Raw App Meta Data** alanına şunu yaz:

   ```json
   { "role": "admin" }
   ```

4. Kaydet. Kullanıcı yeniden giriş yaptığında `isAdmin` rolü otomatik gelir.

Rol atandıktan sonra bir süre eski allowlist de çalışmaya devam eder. Sorunsuz
çalıştığı doğrulandıktan sonra `functions/_lib/admin.js` içindeki
`LEGACY_ADMIN_EMAILS` ve `src/lib/admin.ts` içindeki `LEGACY_ADMIN_EMAIL`
kaldırılabilir. Bu, e-posta ele geçirilse bile yönetici yetkisinin yalnızca
sunucu tarafından atanan role bağlı kalmasını sağlar.

## 2. MFA her sayfada sorulmaz

`ADMIN_MFA_REQUIRED=true` olduğunda:

- Yönetici giriş yaptıktan sonra **oturum başına bir kez** 6 haneli TOTP kodu
  istenir.
- Kod doğrulandıktan sonra Supabase oturumu `aal2` olur.
- Panelde gezinmek, sipariş güncellemek veya sayfa yenilemek her seferinde yeni
  kod istemez.
- Oturum süresi dolduğunda veya cihazdan çıkış yapıldığında yeniden giriş +
  MFA gerekir.

Yani MFA günlük panel kullanımını her tıklamada zorlaştırmaz; yalnızca yeni
oturum açılışında devreye girer.

Google ile giriş kullanılıyorsa Google hesabının kendi 2 adımlı doğrulaması da
açık olmalıdır. Google hesabı ele geçirilirse saldırgan geçerli bir oturum
alabilir; rol kontrolü tek başına bunu engellemez. Bu nedenle:

- Google hesabında güçlü şifre + 2FA
- Supabase TOTP (mümkünse)
- Yönetici oturumlarının cihazlardan çıkışla kapatılması

birlikte kullanılmalıdır.

## 3. Panel dışa aktarma ile gerçek veritabanı yedeği farkı

Paneldeki **Veri Dışa Aktarma (JSON)** şunları içerir:

- Siparişler (Supabase)
- Bülten/e-kitap e-postaları (Supabase)
- Yorumlar (onaylı + bekleyen)
- Statik ürün kataloğu
- Yalnızca o cihazın `localStorage` alanındaki kullanıcı önbelleği

Şunları **içermez**:

- Supabase Auth kullanıcıları ve şifre hashleri
- Oturumlar, refresh token'lar
- Veritabanı şeması, RLS politikaları, index'ler
- Storage dosyaları
- Resend audience/contact listesinin tamamı

Bu nedenle panel yedeği taşınabilir bir **uygulama verisi kopyasıdır**, tam
veritabanı yedeği değildir. Telefondan erişim için pratik bir yedektir; felaket
kurtarma için Supabase'in kendi yedekleme çözümü veya `pg_dump` gerekir.

Supabase ücretsiz planda otomatik günlük yedek olmayabilir. Kalıcı çözüm için:

- Supabase Dashboard → Database → Backups (plan destekliyorsa)
- veya güvenli bir bilgisayardan `pg_dump` ile periyodik yedek
- veya panelden JSON dışa aktarmayı ayda bir düzenli olarak indirme

## 4. Secret taraması

23 Ekim 2026 itibarıyla:

- Çalışma ağacında ve Git geçmişinde uygulamaya ait API token'ı, service-role
  anahtarı, Telegram bot token'ı veya özel anahtar bulunmadı.
- `.env*` dosyaları `.gitignore` kapsamında; yalnızca `.env.example` takip
  ediliyor.
- Eski Netlify fonksiyonları yalnızca `process.env` üzerinden değer okuyordu;
  gömülü secret yoktu.
- Yerel `.playwright-mcp` günlüklerinde Cloudflare panel oturumuna ait geçici
  URL token'ları vardı; bunlar Git'e dahil değildi ve temizlendi.

Yine de daha önce sohbette paylaşılan Cloudflare API token'ı için panelden
**Revoke** yapılması önerilir. Deploy artık `wrangler` oturumuyla yapılıyor.
