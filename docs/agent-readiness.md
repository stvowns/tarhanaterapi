# Agent Readiness — TarhanaTerapi

Cloudflare'ın Agent Readiness / isitagentready.com taraması için uygulanan
sinyaller ve isteğe bağlı sonraki adımlar.

## Güncel durum (21 Ekim 2026)

Cloudflare paneli:

- Quick Wins / Level 1: **5/5**
- Technical Groundwork / Level 2: **1/3** (Link Headers geçti)
- Advanced Integration / Level 3: **0/8** (isteğe bağlı)
- Commerce: **0/5** (isteğe bağlı)

Bağımsız `isitagentready.com` taraması: **Level 3 — Agent-Readable**.
Level 1'in tamamı, Markdown negotiation, Content Signals ve Link Headers geçti.

Level 2'de kalan iki madde bilinçli olarak yapılmadı:

- **API Catalog:** Herkese açık, sürdürülebilir bir API yok.
- **Auth.md + OAuth:** Siteye ait bir OAuth sunucusu yok; `auth.md` insan onaylı
  manuel erişim talebini anlatıyor. Sahte OAuth/PRM metadata eklenmedi.

## Uygulananlar

### 1. robots.txt + Content Signals

`public/robots.txt` içinde `User-agent: *` grubuna eklendi:

```txt
Content-Signal: search=yes, ai-input=yes, ai-train=yes
```

Aynı değer `public/_headers` ve `functions/_middleware.js` üzerinden
`Content-Signal` HTTP başlığı olarak da gönderilir. Böylece hem robots.txt
tarayanlar hem yalnızca header okuyan ajanlar aynı politikayı görür.

`/robots.txt`, `public/_routes.json` içinden Functions'a yönlendirilir ve
`Cache-Control: no-store` ile taze servis edilir. Deploy sonrası eski bir edge
cache kopyası görülürse Cloudflare panelinde **Caching → Configuration → Custom
Purge** ile `/robots.txt` bir kez temizlenmelidir.

Politika değiştirilirse üç yerde birlikte güncellenmelidir. Örneğin yalnızca
arama ve AI yanıtına izin verip model eğitimini kapatmak için:

```txt
Content-Signal: search=yes, ai-input=yes, ai-train=no
```

Bu durumda `robots.txt` içindeki GPTBot/CCBot gibi eğitim botları da `Disallow`
edilmelidir; aksi hâlde sinyaller birbiriyle çelişir.

### 2. Markdown negotiation

Build sırasında her HTML sayfasının yanına bir `.md` kardeşi üretilir:

- `/` → `/index.md`
- `/urunler` → `/urunler.md`
- `/urunler/tarhana-classic` → `/urunler/tarhana-classic.md`
- `/rehber` → `/rehber.md`
- `/rehber/<slug>` → `/rehber/<slug>.md`
- `/kvkk` → `/kvkk.md`

`functions/_middleware.js` gelen `Accept` başlığını q değerleriyle ayrıştırır.
`text/markdown` ağırlığı `text/html`'den düşük değilse aynı adreste
`text/markdown; charset=utf-8` döner. Ayrıca `.md` adresi doğrudan istenirse de
Markdown olarak servis edilir.

Yanıt başlıkları:

```txt
Content-Type: text/markdown; charset=utf-8
Vary: Accept
Content-Signal: search=yes, ai-input=yes, ai-train=yes
X-Markdown-Tokens: <yaklaşık token>
Link: <https://tarhanaterapi.com/...>; rel="canonical"
```

### 3. Link header

HTML sayfalarında RFC 8288 uyumlu keşif başlıkları gönderilir:

```txt
Link: <.../index.md>; rel="alternate"; type="text/markdown",
      <https://tarhanaterapi.com/llms.txt>; rel="describedby"; type="text/plain",
      <https://tarhanaterapi.com/sitemap.xml>; rel="describedby"; type="application/xml"
```

### 4. Ek dosyalar

- `public/auth.md` — ajanların hangi işlemler için kimlik doğrulaması
  gerektirmediğini ve hangi işlemlerin insan onayı istediğini açıklar.
- `public/.well-known/security.txt` — RFC 9116 güvenlik iletişim bilgisi.

## Doğrulama

Build sonrası:

```bash
VITE_SITE_URL=https://tarhanaterapi.com npm run build
node scripts/check-ai-access.mjs https://tarhanaterapi.com
```

Tek tek kontrol:

```bash
curl -sI https://tarhanaterapi.com/robots.txt | grep -i content-signal
curl -sI -H 'Accept: text/markdown' https://tarhanaterapi.com/
curl -s  -H 'Accept: text/markdown' https://tarhanaterapi.com/ | head -30
curl -sI https://tarhanaterapi.com/ | grep -i '^link:'
curl -sI https://tarhanaterapi.com/urunler/tarhana-classic.md
```

Cloudflare dışı bağımsız tarama:

```bash
curl -sS -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://tarhanaterapi.com"}'
```

## İsteğe bağlı, şimdilik ertelenenler

Bunlar Level 2/3 ve ticaret protokolleri başlıklarına girer. TarhanaTerapi'nin
mevcut yapısı için zorunlu değildir:

- **API Catalog (RFC 9727):** Yalnızca herkese açık, sürdürülebilir bir API
  varsa eklenmeli. Sipariş ve yönetim uç noktaları herkese açık değildir.
- **OAuth / OpenID discovery:** Müşteri hesapları Google ile giriş kullanıyor;
  ajanlar için ayrı bir OAuth sunucusu yok.
- **MCP Server Card / A2A Agent Card:** Gerçek bir MCP veya A2A servisi
  yayınlanmadan eklenmemeli.
- **Agent Skills:** Ürün bulma, kargo ve iletişim gibi görevler için anlamlı
  olabilir; ancak ayrı bakım gerektirir.
- **WebMCP:** Tarayıcı içi ajanlara ürün arama/sepet araçları açmak için
  kullanılabilir; güvenlik ve kötüye kullanım incelemesi gerekir.
- **DNS-AID:** Cloudflare DNS'te `_index._agents` SVCB kaydı ve DNSSEC
  gerektirir; düşük öncelikli.
- **x402 / MPP / UCP / ACP / AP2:** Otonom ödeme protokolleri. Mevcut ödeme
  akışı insan onayı ve kart bilgisi gerektirdiği için şimdilik uygun değil.
