# Ruescan — 172 sinyal referansı (GEO + SEO)

> **Kaynak:** [Ruescan signal glossary](https://ruesandora.com/glossary) ve [How Ruescan scores](https://ruesandora.com/how-ruescan-scores) — 23 Ekim 2026, puanlama v2.4.  
> **Eski kayıt:** 11 Ekim 2026 oturumunda `/tools/site-check` hâlâ açıktı; o günkü sayfa 170 sinyal diyordu.  
> **Durum:** 23 Ekim 2026 itibarıyla `/tools/site-check` ve `/ruescan` **301** ile `/?bekleme=ac` adresine gidiyor. Yani araç taşınmadı; Ruescan early-access bekleme listesine alındı.  
> **Kapsam:** Güncel dokümantasyon 198 sinyal diyor. Bunların **172’si açıklanmış**, **26’sı Ruescan’e özel ve açıklanmamış**. Bu dosya 172 açıklanmış sinyalin tamamını içerir.
>
> **Dil notu:** Sinyal adları ve kaynak açıklamaları İngilizce bırakıldı; her sinyalin altına ayrıca **Türkçe özet** eklendi. Böylece kaynakla birebir karşılaştırma bozulmadan anlaşılabilir.

## 1. Kısa cevap: Ruescan ne yapıyor?

Ruescan, bir sitenin **Google’da ve AI cevaplarında** görünmesini etkileyen teknik sinyalleri okuyan bir site tarayıcısıdır. Siteyi tarayıcıda gezip “güzel mi” diye bakmaz; sunucunun ve dosyaların makineye ne söylediğine bakar.

**Okuduğu kaynaklar:**

- DNS kayıtları
- Ana sayfa ve sunucudan gelen ham HTML
- `robots.txt`
- `sitemap.xml`
- `llms.txt` ve `llms-full.txt`
- Sitemap’ten 2 örnek sayfa + varsa diğer dildeki sayfa
- HTTP başlıkları
- Google PageSpeed Insights: mobil/masaüstü, LCP, CLS, TBT, CrUX

**AI botu testi:** Ana sayfayı `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot` ve `ChatGPT-User` kimlikleriyle ister. `robots.txt` bu botlara izin veriyor mu, sunucu/firewall user-agent’ı engelliyor mu diye bakar. Çoğu AI botu JavaScript çalıştırmadığı için **ham HTML’deki metni** ayrıca ölçer.

**Sınırları:** Tüm siteyi crawl etmez; AI cevaplarında markanın anılıp anılmadığını ölçmez; sıralama/trafik tahmini vermez; JavaScript çalıştırmaz; sitede hiçbir şeyi değiştirmez. Sadece herkese açık sayfaları okur.

### GEO ve SEO ayrımı

Ruescan iki işi aynı puan içinde birleştiriyor, ama sinyalleri okurken ayrımı bilmek gerekir:

- **SEO tarafı:** Ana sayfa açılıyor mu, `noindex` var mı, canonical doğru mu, title/meta dolu mu, sitemap geçerli mi, Googlebot girebiliyor mu, hız ve mobil deneyim nasıl? Bunlar klasik arama motoru görünürlüğünün temeli.
- **GEO tarafı:** AI botları (OAI-SearchBot, Claude-SearchBot, PerplexityBot, ChatGPT-User) sayfayı okuyabiliyor mu, ham HTML’de yeterli metin var mı, marka tek bir varlık olarak tanımlı mı, soru başlıkları ve kısa cevaplar var mı, schema görünen içerikle uyumlu mu, sayfa alıntılanabilir mi?
- **Ortak alan:** Schema, başlık yapısı, hız, güvenilir yazar, güncellik ve iç linkler hem SEO’ya hem GEO’ya hizmet eder.

Kısaca: **SEO sayfanın bulunmasını, GEO ise AI cevabında kaynak olarak seçilmesini** hedefler. Ruescan ikisini aynı 0–100 skorda gösterse de bulguları bu ayrımla okumak gerekir.

## 2. Puanlama modeli

Her sinyal beş durumdan birini alır:

- **Solid (1):** ölçüldü ve istenen şey var.
- **Partial (0.5):** ölçüldü ama yarısı var.
- **Open (0):** ölçüldü, eksik veya yanlış.
- **Not measured:** ölçülemedi; puana girmez, ceza değil.
- **Not applicable:** siteye uymuyor (ör. uygulaması olmayan sitede app links); puana girmez.

Sinyal ağırlıkları: **Urgent 5, Important 3, Moderate 2, Polish 1.** Alan puanı, ölçülen sinyallerin ağırlıklı ortalaması; site puanı, alanların kendi ağırlıklarıyla ortalaması.

**Kapılar (gate):** Ciddi hata ölçülürse site puanı tavan yapar:

| Kapı | Ölçülen hata | Site puanı en fazla | Alan tavanı |
|---|---|---:|---:|
| K1 | Ana sayfa başarılı yanıt vermiyor | 20 | — |
| K2 | Ana sayfa `noindex` | 30 | — |
| K3 | Tüm AI arama botları kapalı | 49 | AI erişim: 20 |
| K4 | Sunucu HTML’inde 50 kelimeden az metin | 59 | İçerik: 30 |
| G1 | `robots.txt` sunucu hatası | 70 | — |
| K5 | HTTPS yok | 49 | — |

**Bantlar:** 0–34 Critical, 35–59 Weak, 60–79 Needs work, 80–91 Good, 92–100 Exemplary. Ölçülen ağırlığın %80’inden azı ölçülebildiyse puan **provisional** (geçici) işaretlenir.

## 3. Kategori ağırlıkları

| Kategori | Ağırlık | Toplam sinyal | Bu dosyada açıklanan |
|---|---:|---:|---:|
| AI erişim ve okunurluk | 14 | 22 | 18 |
| Marka beyni: kimlik ve varlık | 12 | 17 | 14 |
| İçerik ve cevap blokları | 12 | 26 | 20 |
| Teknik SEO | 14 | 39 | 34 |
| Hız ve kod | 14 | 29 | 29 |
| Yapısal veri | 10 | 18 | 13 |
| Güvenlik ve başlıklar | 8 | 22 | 22 |
| Paylaşım | 5 | 10 | 10 |
| Dil ve hreflang | 4 | 9 | 6 |
| Uygulama bağlantıları | 7 | 6 | 6 |

> **Not:** “Toplam sinyal” ile “açıklanan” arasındaki fark, Ruescan’in açıklamadığı 26 özel sinyaldir. Bu dosyada olmayanları tahminle doldurmuyoruz; kendi scannerimizda ayrı tasarlamalıyız.

## 4. Sinyal türleri ve kanıt düzeyi

- **Issue:** ölçülen eksik/hata.
- **Possible issue:** bağlama göre hata olabilir.
- **Opportunity:** eksik değil; eklenirse kazanç sağlar.
- **Information, not scored:** yalnız bilgi; puana girmez ve bulgu üretmez.
- **Observed:** doğrudan HTTP, DNS veya HTML’de görüldü.
- **Inferred:** sezgisel kurala/dayanağa dayanır; kesin hata değildir.

## 5. GEO/SEO için öncelikli sinyaller

Kendi scannerimizi yazarken ilk sürüm için en yüksek getirili alt küme:

- **AI erişimi:** AI-01, AI-02, AI-03, AI-04, AI-07, AI-08, AI-24
- **Marka varlığı:** BEY-01, BEY-03, BEY-05, BEY-13
- **Cevap blokları:** ICR-01, ICR-03, ICR-05, ICR-06, ICR-09, ICR-10
- **Teknik temel:** TEK-01, TEK-02, TEK-03, TEK-04, TEK-29
- **Yapısal veri:** YAP-01, YAP-04, YAP-06, YAP-08
- **Hız:** KOD-01, KOD-02, KOD-07
- **Güvenlik/dil:** GUV-01, GUV-02, ULU-01, ULU-02

## 6. 172 sinyalin tam listesi

### 6.1. AI erişim ve okunurluk (18 açıklanmış / 22 toplam, ağırlık 14)

AI botlarının siteye erişimi, robots.txt kuralları, sunucudan gelen ham HTML, llms.txt ve alıntı engelleyen etiketler. GEO açısından en kritik kategori.

#### AI-01 · OAI-SearchBot access

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt lets OAI-SearchBot read the home page.
- **Neden önemli:** OAI-SearchBot is the bot ChatGPT search uses to read sites while answering. If it is blocked, the site may not appear as a source in those answers.
- **Türkçe özet:** robots.txt, OAI-SearchBot'un ana sayfayı okumasına izin veriyor mu? OAI-SearchBot ChatGPT aramasının cevap üretirken siteleri okuduğu bottur; engellenirse site ChatGPT cevaplarında kaynak olarak çıkmayabilir.

#### AI-02 · Claude-SearchBot access

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt lets Claude-SearchBot read the home page.
- **Neden önemli:** Claude-SearchBot is the bot Claude uses to read sites while answering. If it is blocked, the site may not appear as a source in those answers.
- **Türkçe özet:** robots.txt, Claude-SearchBot'a ana sayfayı okuma izni veriyor mu? Claude cevap üretirken bu botu kullanır; engellenirse site Claude cevaplarında kaynak olamayabilir.

#### AI-03 · PerplexityBot access

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt lets PerplexityBot read the home page.
- **Neden önemli:** PerplexityBot is the bot Perplexity uses to read sites while answering. If it is blocked, the site may not appear as a source in those answers.
- **Türkçe özet:** robots.txt, PerplexityBot'a ana sayfayı okuma izni veriyor mu? Perplexity cevap üretirken bu botu kullanır; engellenirse site Perplexity cevaplarında kaynak olamayabilir.

#### AI-04 · AI bots that fetch pages for a user

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** ChatGPT-User, Claude-User and Perplexity-User are not blocked in robots.txt.
- **Neden önemli:** These bots come when a user asks ChatGPT, Claude or Perplexity to open the page. If they are blocked, the AI cannot read it.
- **Türkçe özet:** ChatGPT-User, Claude-User ve Perplexity-User botları robots.txt'te engellenmemiş mi? Kullanıcı bir sayfayı açmalarını istediğinde gelirler; engellenirse AI sayfayı okuyamaz.

#### AI-05 · Training bot status

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Training bots (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) are not blocked; blocking can be a deliberate choice.
- **Neden önemli:** These bots collect content for model training. Blocking them can be deliberate; it does not switch off AI search answers directly, but it can limit how well models know the brand.
- **Türkçe özet:** GPTBot, ClaudeBot, Google-Extended, Applebot-Extended ve CCBot gibi eğitim botlarının durumu. Eğitim botlarını engellemek bilinçli bir tercih olabilir; AI arama cevaplarını doğrudan kapatmaz ama markanın model tarafından bilinmesini sınırlayabilir.

#### AI-06 · Bot identity at the firewall

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** The home page opens when requested as GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot and ChatGPT-User (no firewall block by user agent).
- **Neden önemli:** A request from our server using a bot identity was blocked; the real bot may get a different result. So the result counts as not measured and does not affect the score. To verify: in your server or firewall log, check the status codes of requests from real bot IPs (GPTBot: openai.com/gptbot.json; OAI-SearchBot: openai.com/searchbot.json; ChatGPT-User: openai.com/chatgpt-user.json; PerplexityBot: perplexity.ai/perplexitybot.json).
- **Türkçe özet:** Ana sayfa GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot ve ChatGPT-User kimlikleriyle istendiğinde açılıyor mu? Sunucu user-agent'ı engelliyorsa gerçek bot da etkilenebilir; sonuç kesin değilse 'ölçülmedi' sayılır ve puana girmez.

#### AI-07 · Tags that block quoting

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** No noai, noimageai, nosnippet or max-snippet:0 in meta robots or X-Robots-Tag.
- **Neden önemli:** These directives stop search engines and AI answers from quoting the page; it may not be usable as a source in answers.
- **Türkçe özet:** meta robots veya X-Robots-Tag içinde noai, noimageai, nosnippet veya max-snippet:0 var mı? Bu etiketler arama motorlarının ve AI cevaplarının sayfadan alıntı yapmasını engeller.

#### AI-08 · Text in the server HTML

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the HTML the server sends holds enough readable text.
- **Neden önemli:** Most AI bots do not run JavaScript. If the text loads later, they see an empty or partial page and find nothing to quote.
- **Türkçe özet:** Sunucunun gönderdiği HTML'de yeterli okunabilir metin var mı? Çoğu AI botu JavaScript çalıştırmaz; metin sonradan yükleniyorsa boş veya eksik sayfa görürler.

#### AI-09 · Visible text ratio

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** The share of visible text in the HTML.
- **Neden önemli:** If most of the HTML is scripts, styles and markup, bots read many bytes to reach the text; the risk of truncation and slowness grows.
- **Türkçe özet:** HTML içindeki görünür metin oranı. Sayfa çoğunlukla script/style/markup ise botlar metne ulaşmak için çok bayt okur; kesilme ve yavaşlık riski artar.

#### AI-11 · The llms.txt file

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the site has an llms.txt file (optional; no effect on Google Search).
- **Neden önemli:** llms.txt is an optional proposal (llmstxt.org). Google says such files are not needed for Google Search and will neither help nor harm. The one measured example is similar: in one site's two-month server log (Evil Martians, July 2026), only 37 of about 770 direct requests for llms.txt and llms-full.txt came from named AI assistants. That is a single site's data, not a general rule. Information only; it does not affect the score.
- **Türkçe özet:** llms.txt var mı? Opsiyonel bir öneri dosyasıdır; Google Search'e etkisi yoktur. Ölçülen tek örnekte AI asistanları nadiren istedi; bilgi amaçlıdır, puana girmez.

#### AI-13 · The llms-full.txt file

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** Whether llms-full.txt exists (the site text in one file; optional).
- **Neden önemli:** llms-full.txt is optional. It has no effect on Google Search, and we have no measurement showing it raises citations (in the single-site log, named AI assistants rarely requested it). Information only; it does not affect the score.
- **Türkçe özet:** llms-full.txt var mı? Opsiyoneldir; Google Search'e etkisi yoktur ve alıntıyı artırdığına dair ölçüm yoktur. Bilgi amaçlıdır.

#### AI-14 · Content-Signal line

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** A Content-Signal line in robots.txt (search, ai-input, ai-train preference).
- **Neden önemli:** Content-Signal states whether content may be used for search, AI answers and model training (a Cloudflare proposal). Draft standard: it is not yet clear that major AI crawlers honour it, so it is shown as information only and does not affect the score.
- **Türkçe özet:** robots.txt'te Content-Signal satırı var mı? Search, ai-input ve ai-train tercihini bildiren taslak standarttır; büyük AI crawler'ların uyduğu net değildir. Bilgi amaçlıdır.

#### AI-15 · robots.txt server errors

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt does not return a server error (5xx).
- **Neden önemli:** Under the standard (RFC 9309), bots treat the whole site as off-limits while robots.txt returns a server error.
- **Türkçe özet:** robots.txt 5xx sunucu hatası döndürüyor mu? RFC 9309'a göre robots.txt 5xx dönerken botlar tüm siteyi kapalı sayar.

#### AI-16 · robots.txt size and syntax

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether robots.txt is a reasonable size with no unknown directives or broken lines.
- **Neden önemli:** Google reads only the first 500 KiB of robots.txt and ignores unknown or broken lines. A typo can mean the intended rule is not applied.
- **Türkçe özet:** robots.txt boyutu ve sözdizimi makul mü; bilinmeyen veya bozuk satır var mı? Google ilk 500 KiB'ı okur, bilinmeyen/bozuk satırları yok sayar; bir yazım hatası kuralı devre dışı bırakabilir.

#### AI-18 · The robots.txt file

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** robots.txt exists at the root.
- **Neden önemli:** Bots can still crawl everything, but the easiest way to state AI bot preferences and point to the sitemap is unused.
- **Türkçe özet:** Kökte robots.txt var mı? Botlar yine crawl edebilir ama AI bot tercihlerini ve sitemap'i bildirmenin en kolay yolu kullanılmıyordur.

#### AI-24 · Bingbot access

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt lets Bingbot read the home page.
- **Neden önemli:** Bing's index is used by Copilot and among ChatGPT search sources. If Bingbot is blocked, the site may not appear as a source in those answers.
- **Türkçe özet:** robots.txt, Bingbot'a ana sayfayı okuma izni veriyor mu? Bing dizini Copilot ve ChatGPT arama kaynaklarında kullanılır; Bingbot engellenirse bu cevaplarda kaynak olamayabilirsiniz.

#### AI-25 · Decisions for other AI bots

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** The robots.txt decision for Applebot, Meta-ExternalAgent, Amazonbot, DuckAssistBot, MistralAI-User and OAI-AdsBot (allowed, blocked, unspecified) is noted.
- **Neden önemli:** Siri and Spotlight (Applebot), Meta AI (Meta-ExternalAgent), Alexa (Amazonbot), DuckDuckGo answers (DuckAssistBot) and Mistral (MistralAI-User) read sites with their own bots. If you blocked them on purpose, that is fine; if not, you may not appear as a source in those answers. OAI-AdsBot is different: it only checks pages submitted as ads on ChatGPT and is not used for training; if you do not run ads it does not concern you. Information only; it does not affect the score.
- **Türkçe özet:** Applebot, Meta-ExternalAgent, Amazonbot, DuckAssistBot, MistralAI-User ve OAI-AdsBot için robots kararı. Siri/Spotlight, Meta AI, Alexa, DuckDuckGo ve Mistral kendi botlarıyla okur; bilinçli engel değilse cevaplarda görünmeyebilirsiniz. Bilgi amaçlıdır.

#### AI-26 · Image address only through JavaScript

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the raw HTML holds the image addresses or they sit only in an attribute such as data-src.
- **Neden önemli:** Most AI crawlers do not run JavaScript. If src is empty or a placeholder in the raw HTML and the real address sits in data-src, that image does not exist for them; its alt text and context are lost too. A <noscript> fallback or srcset fixes it.
- **Türkçe özet:** Görsel adresleri ham HTML'de mi, yoksa yalnız data-src gibi bir attribute'ta mı? AI crawler'ları JS çalıştırmaz; src boşsa ve gerçek adres data-src'deyse görsel onlar için yoktur, alt metni de kaybolur.

### 6.2. Marka beyni: kimlik ve varlık (14 açıklanmış / 17 toplam, ağırlık 12)

Markanın tek bir varlık olarak tanınması: Organization/Person schema, tutarlı isim, sameAs, logotype, About/iletişim ve tanım cümlesi.

#### BEY-01 · Identity schema (Organization)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Organization, LocalBusiness or Person JSON-LD exists.
- **Neden önemli:** An identity schema states the brand name, logo, address and accounts in one machine-readable place. AI systems recognize the brand from it.
- **Türkçe özet:** Organization, LocalBusiness veya Person JSON-LD var mı? Kimlik şeması marka adı, logo, adres ve hesapları makine-okunur tek yerde verir; AI markayı bundan tanır.

#### BEY-02 · Persistent identity (@id)

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** The identity node has a stable @id and @id references on the page resolve.
- **Neden önemli:** @id lets every page and schema point to the same entity by one name, so AI systems connect the pieces to one brand.
- **Türkçe özet:** Kimlik düğümünde kalıcı @id var mı ve sayfadaki @id referansları çözülüyor mu? @id, her sayfanın ve şemanın aynı varlığa işaret etmesini sağlar; AI parçaları tek markada birleştirir.

#### BEY-03 · Brand name consistency

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The brand name matches across title, og:site_name, JSON-LD name and the llms.txt title.
- **Neden önemli:** AI systems recognize a brand by its name. If the name differs between title, schema and sharing tags, they may not see one entity.
- **Türkçe özet:** Marka adı title, og:site_name, JSON-LD name ve llms.txt başlığında aynı mı? AI markayı adıyla tanır; isim farklıysa tek varlık olarak görmeyebilir.

#### BEY-04 · Logo in the schema

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The logo URL in the schema opens and returns an image.
- **Neden önemli:** Search engines and AI systems show this logo on the brand card; a logo that does not open is ignored.
- **Türkçe özet:** Şemadaki logo URL'si açılıyor ve görsel dönüyor mu? Arama motorları ve AI marka kartında bu logoyu gösterir; açılmayan logo yok sayılır.

#### BEY-05 · Official profiles (sameAs)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the identity schema lists the brand's official profiles (sameAs).
- **Neden önemli:** sameAs ties the brand's social accounts, Wikipedia/Wikidata entries and profiles to one entity and helps AI systems recognize it.
- **Türkçe özet:** Kimlik şeması resmi profilleri sameAs ile listeliyor mu? sameAs sosyal hesapları, Wikipedia/Wikidata ve profilleri tek varlığa bağlar; AI markayı tanır.

#### BEY-08 · About page

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The home page links to an About page and it opens.
- **Neden önemli:** An About page says who the brand is, what it does and who stands behind it; AI answers and trust signals draw on it.
- **Türkçe özet:** Ana sayfa About sayfasına link veriyor ve sayfa açılıyor mu? About sayfası markanın kim olduğunu, ne yaptığını ve arkasında kimin olduğunu anlatır; AI cevapları ve güven sinyalleri bundan beslenir.

#### BEY-09 · Contact signal

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A contact signal: a contact page link, a tel:/mailto: link, or an address/phone in the schema.
- **Neden önemli:** A reachable contact route signals a real business; AI answers use it for "how do I reach them". Note: numbers and addresses are not stored, only presence is checked.
- **Türkçe özet:** İletişim sinyali var mı: iletişim sayfası linki, tel:/mailto: veya şemada adres/telefon? Ulaşılabilir iletişim gerçek işletme sinyalidir; AI 'nasıl ulaşırım' cevaplarında kullanır. Numara ve adres saklanmaz, yalnızca varlığı kontrol edilir.

#### BEY-10 · Meta and schema description match

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the meta description and the schema description say the same thing.
- **Neden önemli:** If the two descriptions say different things, AI systems may summarize what the brand does inconsistently.
- **Türkçe özet:** Meta description ile şema description aynı şeyi mi söylüyor? İki açıklama farklıysa AI markanın ne yaptığını tutarsız özetleyebilir.

#### BEY-11 · Founder and author entity

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** A founder, author or person entity (founder, author, Person) is defined.
- **Neden önemli:** Founder or author information is an expertise and trust (E-E-A-T) signal; AI answers use it for "who is behind this".
- **Türkçe özet:** Kurucu, yazar veya kişi varlığı (founder, author, Person) tanımlı mı? Kurucu/yazar bilgisi uzmanlık ve güven (E-E-A-T) sinyalidir; AI 'arkasında kim var' cevabında kullanır.

#### BEY-12 · Service area and expertise

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the identity schema carries service area, expertise and offers (areaServed, knowsAbout, makesOffer).
- **Neden önemli:** These fields say what the brand offers, where and to whom, so AI systems connect it to the right questions.
- **Türkçe özet:** Kimlik şeması hizmet alanı, uzmanlık ve teklifleri taşıyor mu (areaServed, knowsAbout, makesOffer)? Bu alanlar markanın ne sunduğunu, nerede ve kime sunduğunu söyler; AI doğru sorularla eşleştirir.

#### BEY-13 · Brand definition sentence

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** The first two paragraphs contain a definition sentence that names the brand.
- **Neden önemli:** AI answers to "what is X?" often quote the definition sentence near the top. A clear definition that names the brand makes that quote easy.
- **Türkçe özet:** İlk iki paragrafta markayı adıyla tanımlayan bir tanım cümlesi var mı? AI 'X nedir?' cevaplarında genellikle üstteki tanım cümlesini alıntılar; net tanım alıntıyı kolaylaştırır.

#### BEY-15 · Knowledge base page

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** A knowledge base page exists: FAQ, help, docs or glossary (linked from the home page or in the sitemap).
- **Neden önemli:** Q&A and documentation pages are among the most quoted by AI answers; they offer brand knowledge in ready-to-quote form.
- **Türkçe özet:** Bilgi tabanı sayfası var mı: SSS, yardım, dokümantasyon veya sözlük (ana sayfadan veya sitemap'ten linkli)? Soru-cevap ve dokümantasyon sayfaları AI cevaplarında en çok alıntılananlardandır; marka bilgisini hazır alıntı halinde sunar.

#### BEY-16 · Social links and sameAs match

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Social profile links on the page are also listed in the schema sameAs.
- **Neden önemli:** When the visible profiles and the schema sameAs agree, AI systems can be sure those accounts belong to the brand.
- **Türkçe özet:** Sayfadaki sosyal profil linkleri şemadaki sameAs ile eşleşiyor mu? Görünen profiller ve sameAs uyuşursa AI hesapların markaya ait olduğundan emin olur.

#### BEY-20 · Brand name distinctiveness

- **Tür:** Information, not scored · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the brand name consists only of common words.
- **Neden önemli:** If the brand name is made of common words, branded searches may be read as topic searches. Add alternateName to the WebSite schema and track branded queries separately in Search Console. Information only; it does not affect the score.
- **Türkçe özet:** Marka adı yalnızca yaygın kelimelerden mi oluşuyor? Yaygın kelimelerden oluşan ad, marka aramalarını konu araması gibi okutabilir; WebSite schema'ya alternateName ekleyin. Bilgi amaçlıdır.

### 6.3. İçerik ve cevap blokları (20 açıklanmış / 26 toplam, ağırlık 12)

AI cevaplarının alıntılayabileceği içerik yapısı: tek H1, soru başlıkları, kısa cevap, SSS, liste/tablo, somut veri, yazar ve güncellik.

#### ICR-01 · A single H1

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Exactly one H1 heading.
- **Neden önemli:** The H1 is the first place that tells bots and readers what the page is about; a single, clear H1 makes the topic plain.
- **Türkçe özet:** Tam olarak bir H1 var mı? H1, sayfanın ne hakkında olduğunu botlara ve okuyucuya ilk söyleyen yerdir; tek ve net H1 konuyu açıklaştırır.

#### ICR-02 · Heading order

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Heading levels do not skip (H1 → H2 → H3).
- **Neden önemli:** The heading tree is the page's table of contents; skips make it harder for bots and screen readers to group sections.
- **Türkçe özet:** Başlık seviyeleri atlanmadan mı gidiyor (H1, H2, H3)? Başlık ağacı sayfanın içindekiler tablosudur; atlamalar botların ve ekran okuyucuların bölümleri gruplamasını zorlaştırır.

#### ICR-03 · Question-style headings

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether some headings are phrased as questions ("what", "how", "?").
- **Neden önemli:** People ask AI questions. A question heading with a short answer right below is the easiest structure for answer engines to quote.
- **Türkçe özet:** Başlıkların bir kısmı soru biçiminde mi ('ne', 'nasıl', '?')? İnsanlar AI'ya soru sorar; soru başlığı ve altında kısa cevap, cevap motorlarının alıntılaması için en kolay yapıdır.

#### ICR-04 · FAQ block

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** An FAQ block: FAQPage schema or collapsible Q&A (details/summary).
- **Neden önemli:** An FAQ block offers short, self-contained answers; AI answers and search results use them directly.
- **Türkçe özet:** SSS bloğu var mı: FAQPage schema veya açılır Q&A (details/summary)? SSS bloğu kısa ve kendi kendine yeten cevaplar sunar; AI cevapları ve arama sonuçları doğrudan kullanır.

#### ICR-05 · Upfront answer

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the first paragraph after the H1 names the topic and answers it directly.
- **Neden önemli:** Answer engines quote the short paragraph at the top that answers the heading directly. A clear opening that names the topic and carries facts (numbers, dates, names) raises the chance of being quoted.
- **Türkçe özet:** H1'den sonraki ilk paragraf konuyu adlandırıp doğrudan cevaplıyor mu? Cevap motorları başlığı doğrudan yanıtlayan üstteki kısa paragrafı alıntılar; sayı, tarih ve isim içeren net giriş alıntılanma şansını artırır.

#### ICR-06 · Lists and tables

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** The page has a list or table (quotable structure).
- **Neden önemli:** Lists and tables give steps, comparisons and features to AI answers in ready-made form.
- **Türkçe özet:** Sayfada liste veya tablo var mı (alıntılanabilir yapı)? Liste ve tablolar adımları, karşılaştırmaları ve özellikleri AI cevaplarına hazır biçimde verir.

#### ICR-07 · Content freshness

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the page shows a recent update date (dateModified or <time>).
- **Neden önemli:** AI answers and search engines prefer fresh sources; a machine-readable date says when the content was updated.
- **Türkçe özet:** Sayfa güncel bir güncelleme tarihi gösteriyor mu (dateModified veya time etiketi)? AI cevapları ve arama motorları taze kaynakları tercih eder; makine-okunur tarih içeriğin ne zaman güncellendiğini söyler.

#### ICR-08 · Author byline

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** An author or byline: meta author, rel=author or an article with an author in the schema.
- **Neden önemli:** Who wrote the content is an expertise and trust signal; AI systems look at it when weighing a source.
- **Türkçe özet:** Yazar/byline var mı: meta author, rel=author veya şemada author? İçeriği kimin yazdığı uzmanlık ve güven sinyalidir; AI bir kaynağı tartarken buna bakar.

#### ICR-09 · Citing outside sources

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the page links to another source as a citation (social networks do not count).
- **Neden önemli:** Content that cites sources is seen as more trustworthy; AI answers look for the basis of what they quote.
- **Türkçe özet:** Sayfa dış bir kaynağa atıf linki veriyor mu (sosyal ağlar sayılmaz)? Kaynak gösteren içerik daha güvenilir görünür; AI cevapları alıntıladığı şeyin dayanağını arar.

#### ICR-10 · Fact density

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the text carries enough concrete facts such as numbers, percentages, dates or amounts.
- **Neden önemli:** Sentences with concrete numbers and dates get quoted more in AI answers; vague statements do not.
- **Türkçe özet:** Metin yeterince somut gerçek içeriyor mu: sayı, yüzde, tarih, tutar? Somut sayı ve tarih içeren cümleler AI cevaplarında daha çok alıntılanır; belirsiz ifadeler alıntılanmaz.

#### ICR-11 · Image alt text

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Every image has alt text.
- **Neden önemli:** An image without alt text tells screen readers and bots nothing. The first 50 images on the page are checked.
- **Türkçe özet:** Her görselin alt metni var mı? Alt metinsiz görsel ekran okuyucuya ve botlara bir şey söylemez; sayfadaki ilk 50 görsel kontrol edilir.

#### ICR-14 · Blog or guide freshness

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether a blog or guide section exists and was updated recently.
- **Neden önemli:** Regularly published guides grow the pool of sources AI answers can cite and show the brand's expertise.
- **Türkçe özet:** Blog veya rehber bölümü var mı ve yakın zamanda güncellenmiş mi? Düzenli yayınlanan rehberler AI cevaplarının alıntılayabileceği kaynak havuzunu büyütür ve markanın uzmanlığını gösterir.

#### ICR-15 · Keyword consistency

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the main concepts of the text also appear in the title, description and headings.
- **Neden önemli:** If the text covers one topic while the title and description use other words, search engines and AI systems may misread the topic.
- **Türkçe özet:** Metnin ana kavramları title, description ve başlıklarda da geçiyor mu? Metin bir konuyu anlatırken title/description başka kelimeler kullanıyorsa arama motorları ve AI konuyu yanlış okuyabilir.

#### ICR-16 · Internal link anchors

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether internal link anchors describe the target (generic anchors such as "click here", very long anchors, the same anchor pointing to different targets).
- **Neden önemli:** Anchor text tells bots what the target page is. "Click here", or the same text pointing to different pages, erases that information.
- **Türkçe özet:** İç link anchor'ları hedefi tanımlıyor mu? 'Buraya tıkla' gibi genel anchor, çok uzun anchor veya aynı anchor'ın farklı hedeflere gitmesi botlara hedefin ne olduğunu söylemez.

#### ICR-17 · Placeholder and duplicate text

- **Tür:** Issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether there is placeholder text, duplicated paragraphs or overly long sentences.
- **Neden önemli:** Placeholder text looks unfinished; duplicated text and very long sentences tire both readers and AI summaries.
- **Türkçe özet:** Placeholder metin, tekrarlanan paragraf veya aşırı uzun cümle var mı? Placeholder yarım kalmış görünür; tekrarlar ve çok uzun cümleler hem okuyucuyu hem AI özetini yorar.

#### ICR-18 · Readability

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the share of long sentences hurts readability.
- **Neden önemli:** Short sentences are easy for readers and AI summaries; long ones get cut or lose meaning when quoted.
- **Türkçe özet:** Uzun cümlelerin oranı okunabilirliği bozuyor mu? Kısa cümleler okuyucu ve AI özeti için kolaydır; uzun cümleler alıntılanırken kesilir veya anlamını kaybeder.

#### ICR-19 · Sentence-opening variety

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether consecutive sentences start with the same word.
- **Neden önemli:** Consecutive sentences starting with the same word make text monotonous; readers and AI summaries read it as repetition.
- **Türkçe özet:** Ardışık cümleler aynı kelimeyle mi başlıyor? Aynı kelimeyle başlayan ardışık cümleler metni monotonlaştırır; okuyucu ve AI özeti bunu tekrar olarak okur.

#### ICR-20 · Transition words

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether transition words (also, because, for example...) are used enough; Turkish and English.
- **Neden önemli:** Transition words make the link between sentences (cause, example, result) explicit, so readers and AI summaries can follow.
- **Türkçe özet:** Geçiş ifadeleri (ayrıca, çünkü, örneğin...) yeterince kullanılmış mı? Geçiş ifadeleri cümleler arasındaki nedeni, örneği ve sonucu açık eder; okuyucu ve AI özeti takip edebilir.

#### ICR-30 · Title, H1 and og:title match

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the <title>, the first H1 and og:title share words.
- **Neden önemli:** Google builds the title in search results from sources such as <title>, H1 and og:title. If they say different things, the title shown may be one you did not choose; shared links show yet another title.
- **Türkçe özet:** title, ilk H1 ve og:title ortak kelimeler taşıyor mu? Google arama sonucu başlığını bu kaynaklardan kurar; farklı şeyler söylerlerse seçmediğiniz başlık görünebilir.

#### ICR-31 · Author page and Person schema

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the article's author link goes to a working page and the author is defined as a Person.
- **Neden önemli:** A named author, a working author page and Person markup show readers, search engines and AI systems who the content comes from (an E-E-A-T practice). It is an opportunity: if missing the page does not drop from the index, only the trust signal is weak. Schema alone is not proven to raise citations.
- **Türkçe özet:** Yazar linki çalışan bir sayfaya gidiyor ve yazar Person olarak tanımlı mı? İsimli yazar, çalışan yazar sayfası ve Person işaretlemesi içeriğin kimden geldiğini gösterir (E-E-A-T). Fırsattır; eksikse sayfa indeksten düşmez, yalnız güven sinyali zayıflar.

### 6.4. Teknik SEO (34 açıklanmış / 39 toplam, ağırlık 14)

İndekslenebilirlik, canonical, title/meta, sitemap, 404, www yönlendirmesi, iç linkler, charset ve crawl sinyalleri.

#### TEK-01 · Home page response

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The home page answers with success (2xx).
- **Neden önemli:** Search engines and AI bots do not index a page that returns an error, and the rest of the site is discovered from it.
- **Türkçe özet:** Ana sayfa başarılı (2xx) yanıt veriyor mu? Hata dönen sayfayı arama motorları ve AI botları indekslemez; sitenin geri kalanı da buradan keşfedilir.

#### TEK-02 · Indexability (noindex)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The home page is indexable: no noindex in meta robots or X-Robots-Tag.
- **Neden önemli:** noindex tells search engines not to show the page; AI search will not use it as a source either.
- **Türkçe özet:** Ana sayfa indekslenebilir mi; meta robots veya X-Robots-Tag'de noindex yok mu? noindex arama motorlarına sayfayı göstermemeyi söyler; AI araması da kaynak olarak kullanmaz.

#### TEK-03 · Canonical tag

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A rel="canonical" tag exists.
- **Neden önemli:** The page does not state its main address. If the same content opens at several addresses, a search engine may pick the wrong one.
- **Türkçe özet:** rel=canonical etiketi var mı? Sayfa ana adresini söylemez; aynı içerik birden çok adreste açılırsa arama motoru yanlışını seçebilir.

#### TEK-04 · Canonical correctness

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** The canonical points to the same domain and to the page itself, as an absolute URL (https://…).
- **Neden önemli:** If that is not intended, search engines index that address instead of this page.
- **Türkçe özet:** Canonical aynı domaine ve sayfanın kendisine, mutlak https URL olarak mı işaret ediyor? Bilinçli değilse arama motorları bu sayfa yerine o adresi indeksler.

#### TEK-05 · Title tag

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A non-empty <title> exists.
- **Neden önemli:** Search results and AI answers read the page name from the <title> tag.
- **Türkçe özet:** Boş olmayan title etiketi var mı? Arama sonuçları ve AI cevapları sayfanın adını title'dan okur.

#### TEK-06 · Title length

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the title is short enough to show in a search result without being cut.
- **Neden önemli:** Google cuts the title at about 580 px on desktop. A very short title cannot say both what the page is and who the brand is.
- **Türkçe özet:** Title arama sonucunda kesilmeden görünecek kadar kısa mı? Google title'ı masaüstünde yaklaşık 580 px'te keser; çok kısa title ne sayfayı ne markayı anlatabilir.

#### TEK-07 · Meta description

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A meta description exists.
- **Neden önemli:** The short text in search results usually comes from this tag; without it, the search engine picks a snippet itself.
- **Türkçe özet:** Meta description var mı? Arama sonucundaki kısa metin genellikle bu etiketten gelir; yoksa arama motoru kendi snippet'ini seçer.

#### TEK-08 · Meta description length

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the meta description fits a search result and still describes the page.
- **Neden önemli:** A short description leaves space unused; a long one gets cut. 120-160 characters says enough without being cut.
- **Türkçe özet:** Meta description arama sonucuna sığıyor ve sayfayı anlatıyor mu? Kısa açıklama alanı boşa bırakır, uzun olan kesilir; 120-160 karakter yeterince anlatır.

#### TEK-09 · Sitemap presence

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A sitemap is found (Sitemap line in robots.txt or /sitemap.xml).
- **Neden önemli:** A sitemap tells bots which pages exist and when they changed.
- **Türkçe özet:** Sitemap bulunuyor mu (robots.txt'te Sitemap satırı veya /sitemap.xml)? Sitemap botlara hangi sayfaların olduğunu ve ne zaman değiştiğini söyler.

#### TEK-10 · Sitemap validity

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The sitemap is valid XML (<urlset> or <sitemapindex>).
- **Neden önemli:** The address answers, but there is no <urlset> or <sitemapindex>. Bots will not recognize it as a sitemap.
- **Türkçe özet:** Sitemap geçerli XML mi (urlset veya sitemapindex)? Adres yanıt veriyor ama urlset/sitemapindex yoksa botlar bunu sitemap olarak tanımaz.

#### TEK-11 · URLs in the sitemap

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the sitemap lists any URLs.
- **Neden önemli:** There is no <loc> in the sitemap, so it points bots to no pages.
- **Türkçe özet:** Sitemap herhangi bir URL listeliyor mu? Sitemap'te loc yoksa botları hiçbir sayfaya yönlendirmez.

#### TEK-12 · Sitemap lastmod

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the URLs in the sitemap carry a <lastmod> date.
- **Neden önemli:** Dates help bots crawl changed pages first.
- **Türkçe özet:** Sitemap URL'leri lastmod tarihi taşıyor mu? Tarihler botların değişen sayfaları önce crawl etmesine yardım eder.

#### TEK-13 · Sitemap line in robots.txt

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt has a Sitemap: line with an absolute (https://…) URL.
- **Neden önemli:** That line lets every bot find the sitemap on its own.
- **Türkçe özet:** robots.txt'te mutlak (https://) Sitemap satırı var mı? Bu satır her botun sitemap'i kendi başına bulmasını sağlar.

#### TEK-15 · Custom 404 page

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A non-existent address returns 404 (or 410) with a custom error page.
- **Neden önemli:** If a missing page returns 200, search engines and bots treat empty pages as real content (soft 404). A custom 404 page guides visitors back.
- **Türkçe özet:** Olmayan adres 404 (veya 410) ve özel hata sayfası döndürüyor mu? Eksik sayfa 200 dönerse arama motorları ve botlar boş sayfaları gerçek içerik sanır (soft 404). Özel 404 ziyaretçiyi geri yönlendirir.

#### TEK-16 · www and bare domain

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** www and the bare domain resolve to one address (the other variant redirects or does not exist).
- **Neden önemli:** If both addresses open without redirecting, the same site is indexed twice and links and signals are split.
- **Türkçe özet:** www ve kök domain tek adrese mi çözülüyor (diğeri yönleniyor veya yok)? İkisi de yönlendirmeden açılırsa aynı site iki kez indekslenir, link ve sinyaller bölünür.

#### TEK-17 · Home page redirects

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the home page is reached without a needless redirect chain.
- **Neden önemli:** Each redirect delays loading and spends the bots' crawl budget.
- **Türkçe özet:** Ana sayfaya gereksiz yönlendirme zinciri olmadan ulaşılıyor mu? Her yönlendirme yüklemeyi geciktirir ve botların crawl bütçesini harcar.

#### TEK-19 · Tracking parameters in internal links

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** No tracking or session parameters (utm_, gclid, sessionid...) in internal links.
- **Neden önemli:** Parameterized internal links create many copies of the same page; bots waste time and signals are split.
- **Türkçe özet:** İç linklerde utm_, gclid, sessionid gibi takip veya oturum parametreleri yok mu? Parametreli iç linkler aynı sayfanın birçok kopyasını oluşturur; botlar zaman kaybeder, sinyaller bölünür.

#### TEK-21 · Internal links from the home page

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the home page links to enough distinct inner pages.
- **Neden önemli:** Bots discover the rest of the site through home page links; with few links, important pages go unfound.
- **Türkçe özet:** Ana sayfa yeterince farklı iç sayfaya link veriyor mu? Botlar sitenin geri kalanını ana sayfa linklerinden keşfeder; az link varsa önemli sayfalar bulunamaz.

#### TEK-22 · Content type (text/html)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The home page is served as HTML (text/html).
- **Neden önemli:** Browsers and bots may not read a page served with the wrong type as HTML.
- **Türkçe özet:** Ana sayfa text/html olarak mı sunuluyor? Yanlış içerik tipiyle sunulan sayfayı tarayıcılar ve botlar HTML olarak okumayabilir.

#### TEK-23 · Charset in the HTTP header

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The character set is in the HTTP header (Content-Type: text/html; charset=utf-8).
- **Neden önemli:** A charset in the header lets browsers and bots decode the page correctly from the first byte and prevents broken characters.
- **Türkçe özet:** Karakter seti HTTP başlığında mı (Content-Type: text/html; charset=utf-8)? Header'daki charset, tarayıcı ve botların sayfayı ilk bayttan doğru çözmesini sağlar; bozuk karakterleri önler.

#### TEK-28 · Response on the first request

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the home page answers successfully on the first request.
- **Neden önemli:** During the scan the home page first returned an error (e.g. 503 during a deploy). This may have been a brief outage, so the score is marked provisional. If it happens often, deploy without downtime or send Retry-After on the maintenance page.
- **Türkçe özet:** Ana sayfa ilk istekte başarılı yanıt veriyor mu? Tarama sırasında ilk istek hata (örneğin deploy sırasında 503) döndüyse kısa kesinti olabilir; puan geçici işaretlenir. Sık oluyorsa kesintisiz deploy veya bakım sayfasında Retry-After kullanın.

#### TEK-29 · Googlebot access

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** robots.txt lets Googlebot read the home page.
- **Neden önemli:** If Googlebot is blocked, Google cannot crawl the site; pages are not refreshed in search and can drop out of results over time. It is usually a "Disallow: /" line left by mistake.
- **Türkçe özet:** robots.txt, Googlebot'a ana sayfayı okuma izni veriyor mu? Googlebot engellenirse Google siteyi crawl edemez; sayfalar yenilenmez ve zamanla sonuçlardan düşebilir. Genellikle yanlışlıkla kalmış Disallow: / satırıdır.

#### TEK-30 · Single canonical

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The page has a single canonical and it is inside <head>.
- **Neden önemli:** Google accepts a canonical only inside <head>; a tag in the body is ignored. If several canonicals point to different addresses, Google may ignore them.
- **Türkçe özet:** Tek canonical var mı ve head içinde mi? Google canonical'ı yalnızca head içinde kabul eder; body'deki yok sayılır. Birden çok canonical farklı adresleri gösteriyorsa hepsi yok sayılabilir.

#### TEK-31 · Charset conflict

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the meta charset and the HTTP header charset agree.
- **Neden önemli:** If the header and the meta tag name different character sets, the browser picks the header; if the page was written for the other one, accented characters can break.
- **Türkçe özet:** Meta charset ile HTTP header charset aynı mı? Farklılarsa tarayıcı header'ı seçer; sayfa diğerine göre yazıldıysa Türkçe karakterler bozulabilir.

#### TEK-34 · Bing verification tag

- **Tür:** Information, not scored · **Kanıt:** Observed
- **Ne ölçüyor:** A Bing Webmaster verification tag (msvalidate.01) was seen.
- **Neden önemli:** The site has a Bing Webmaster Tools verification tag; it may be registered with Bing (a source for Copilot and ChatGPT search). Information only; it does not affect the score.
- **Türkçe özet:** Bing Webmaster doğrulama etiketi (msvalidate.01) var mı? Site Bing Webmaster Tools'a kayıtlı olabilir; Bing dizini Copilot ve ChatGPT aramasında kaynaktır. Bilgi amaçlıdır, puana girmez.

#### TEK-36 · Sitemap size limit

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the sitemap file exceeds Google's size and URL limit.
- **Neden önemli:** Google accepts a single sitemap up to 50 MB (uncompressed) and 50,000 URLs; the rest is not processed. Large sites split the sitemap into parts and give a sitemap index.
- **Türkçe özet:** Sitemap Google'ın boyut ve URL limitini aşıyor mu? Google tek sitemap'te 50 MB (sıkıştırılmamış) ve 50.000 URL kabul eder; fazlası işlenmez. Büyük siteler sitemap'i parçalara ayırıp index verir.

#### TEK-37 · The max-image-preview directive

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Meta robots or X-Robots-Tag has max-image-preview:large.
- **Neden önemli:** Without it Google may show a default-size preview. For a large image preview (Discover included) the page should say "max-image-preview:large".
- **Türkçe özet:** meta robots veya X-Robots-Tag'de max-image-preview:large var mı? Yoksa Google varsayılan boyutta önizleme gösterebilir; büyük görsel önizlemesi (Discover dahil) için bu direktif gerekir.

#### TEK-38 · HTTP canonical header

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether there is no HTTP Link: rel="canonical" header, or it names the same address as the HTML canonical.
- **Neden önemli:** The server header names one address as canonical and the page's <link rel="canonical"> another. Google says using both is error prone; a conflicting signal may be ignored and an address you did not choose may be picked. Pick one method.
- **Türkçe özet:** HTTP Link: rel=canonical header yok mu veya HTML canonical ile aynı adresi mi gösteriyor? Sunucu header'ı bir adresi, sayfadaki link başka adresi canonical gösteriyorsa çelişkili sinyal oluşur; Google ikisini de yok sayıp istemediğiniz adresi seçebilir. Tek yöntem seçin.

#### TEK-39 · Sitemap cache time

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the sitemap cache time (CDN included) stays within a reasonable limit.
- **Neden önemli:** If the sitemap stays in cache for a long time, newly published pages reach search engines and AI crawlers late. Keep its Cache-Control short (e.g. max-age=3600) or purge the CDN cache when a page is added. The threshold is a heuristic.
- **Türkçe özet:** Sitemap cache süresi (CDN dahil) makul sınırda mı? Sitemap uzun süre cache'te kalırsa yeni sayfalar arama motorlarına ve AI crawler'larına geç ulaşır. Cache-Control'ü kısa tutun veya sayfa ekleyince CDN cache'ini temizleyin. Eşik sezgiseldir.

#### TEK-40 · Noindex pages in the sitemap

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Sampled sitemap pages have no noindex in meta robots or X-Robots-Tag.
- **Neden önemli:** A sitemap says "index this page"; if the page says noindex the signals conflict. Google will not index these addresses and Search Console reports "Submitted URL marked noindex". Either remove noindex from the page or remove the address from the sitemap.
- **Türkçe özet:** Sitemap'ten örneklenen sayfalarda noindex yok mu? Sitemap 'bu sayfayı indeksle' der; sayfa noindex diyorsa sinyaller çelişir. Google bu adresleri indekslemez ve Search Console 'Submitted URL marked noindex' gösterir.

#### TEK-41 · Pagination canonical

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the canonical of paginated pages points to the page itself rather than to the first page.
- **Neden önemli:** If page 2, 3, 4... name page 1 as canonical, Google treats them as copies of page 1; products or posts on later pages may not be discovered or indexed. Each paginated page should be self-canonical (rel=next/prev is no longer used by Google).
- **Türkçe özet:** Sayfalama canonical'ı sayfanın kendisini mi gösteriyor, ilk sayfayı mı? 2, 3, 4... sayfaları canonical olarak 1. sayfayı gösterirse Google onları 1. sayfanın kopyası sayar; sonraki sayfalardaki ürün veya yazılar keşfedilmeyebilir. Her sayfa kendini canonical göstermeli.

#### TEK-42 · Canonical target opens

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether a canonical that points elsewhere opens normally, does not redirect and carries no noindex.
- **Neden önemli:** The canonical tells search engines "this is the main address". If that address does not open, is noindex or redirects elsewhere, search engines ignore the signal or quietly drop the page from the index. Some CDNs and security layers also redirect to the canonical target; a wrong canonical hides the page.
- **Türkçe özet:** Başka adresi gösteren canonical açılıyor mu, yönlenmiyor ve noindex taşımıyor mu? Canonical 'ana adres bu' der. O adres açılmıyorsa, noindex'se veya başka yere yönleniyorsa arama motoru sinyali yok sayar veya sayfayı indeksten düşürür. Bazı CDN ve güvenlik katmanları da canonical hedefe yönlendirir; yanlış canonical sayfayı gizler.

#### TEK-43 · Analytics tag loaded twice

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether each measurement ID is loaded once on the page and whether gtag.js and Tag Manager sit together.
- **Neden önemli:** If the same ID loads twice, every visit is counted twice: sessions, page views and conversions inflate, and reports and ad optimisation run on wrong data. If gtag.js and Tag Manager sit together, the container may also send the same GA4 ID (we cannot see inside the container), so this is flagged as "possible".
- **Türkçe özet:** Her ölçüm ID'si sayfada bir kez mi yükleniyor; gtag.js ile Tag Manager birlikte mi? Aynı ID iki kez yüklenirse her ziyaret iki kez sayılır; oturum, sayfa görüntüleme ve dönüşümler şişer, raporlar ve reklam optimizasyonu yanlış veriyle çalışır. gtag.js ve Tag Manager birlikteyse container aynı GA4 ID'sini de gönderebilir; bu yüzden 'olası' işaretlenir.

#### TEK-44 · Same lastmod day across the sitemap

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether nearly all dated sitemap URLs share one day; if so, lastmod may be auto-generated.
- **Neden önemli:** If every URL looks updated on the same day, the date may come from when the sitemap was generated rather than from a page change. Google uses lastmod only when it is consistent and accurate, so in that case crawl priority cannot use it. If the whole site really was republished that day, this is not an error.
- **Türkçe özet:** Sitemap'teki tarihli URL'lerin neredeyse hepsi aynı günü mü paylaşıyor; lastmod otomatik mi üretiliyor? Her URL aynı gün güncellenmiş görünüyorsa tarih sayfa değişikliğinden değil sitemap üretiminden geliyor olabilir. Google lastmod'u yalnız tutarlı ve doğruysa kullanır; o zaman crawl önceliği bu tarihten yararlanamaz. Tüm site gerçekten o gün yeniden yayınlandıysa hata değil.

### 6.5. Hız ve kod (29 açıklanmış / 29 toplam, ağırlık 14)

PageSpeed/Lighthouse, Core Web Vitals, TTFB, sıkıştırma, render-blocking kaynaklar, görsel/font optimizasyonu ve DOM ağırlığı.

#### KOD-01 · PageSpeed mobile performance

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The Google PageSpeed mobile performance score.
- **Neden önemli:** Google PageSpeed (Lighthouse) mobile test. 90+ is good, 50-89 needs work, below 50 is poor. Visitors and bots abandon slow pages.
- **Türkçe özet:** Google PageSpeed mobil performans puanı. Lighthouse mobil testinde 90+ iyi, 50-89 iyileştirme gerekir, 50 altı zayıftır. Yavaş sayfaları ziyaretçi ve botlar terk eder.

#### KOD-02 · LCP: largest contentful paint

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** LCP, the time the main content takes to appear, against Google's Core Web Vitals guidance.
- **Neden önemli:** Time until the largest element is on screen; one of the three Core Web Vitals Google uses in ranking.
- **Türkçe özet:** LCP: ana içeriğin görünme süresi, Google Core Web Vitals eşiğine göre. En büyük öğenin ekrana gelme süresidir; Google'ın sıralamada kullandığı üç Core Web Vital'dan biridir.

#### KOD-03 · CLS: layout shift

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** CLS, how much the layout shifts while loading, against Google's Core Web Vitals guidance.
- **Neden önemli:** How much elements move while loading; it causes mis-clicks and is one of Google's Core Web Vitals.
- **Türkçe özet:** CLS: yükleme sırasında düzen kayması, Core Web Vitals eşiğine göre. Öğelerin yüklenirken ne kadar kaydığıdır; yanlış tıklamalara yol açar ve Google Core Web Vitals'tan biridir.

#### KOD-04 · TBT: total blocking time

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** TBT, the total time the main thread is blocked.
- **Neden önemli:** Heavy JavaScript locks the page while loading; taps and clicks lag.
- **Türkçe özet:** TBT: ana thread'in toplam bloke olduğu süre. Ağır JavaScript sayfayı yüklerken kilitler; dokunma ve tıklamalar gecikir.

#### KOD-05 · FCP: first contentful paint

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** FCP, the time the first content takes to appear.
- **Neden önemli:** Visitors see the first thing on screen after this long; if it is long, the page feels empty.
- **Türkçe özet:** FCP: ilk içeriğin görünme süresi. Ziyaretçi ilk şeyi bu süre sonunda görür; uzunsa sayfa boş hissi verir.

#### KOD-06 · Real-user data (CrUX)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** LCP, INP and CLS in real Chrome user data (CrUX). Without data the signal is not measured.
- **Neden önemli:** This is not a lab test; it comes from the site's real Chrome users, and Google uses it in ranking.
- **Türkçe özet:** Gerçek Chrome kullanıcı verisinde (CrUX) LCP, INP ve CLS. Veri yoksa ölçülmez. Laboratuvar testi değildir; sitenin gerçek Chrome kullanıcılarından gelir ve Google sıralamada kullanır.

#### KOD-07 · Server response time (TTFB)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** How quickly the server sends its first response (TTFB).
- **Neden önemli:** A slow first response delays every page; bots crawl slow sites less. Measured from our server (Cloudflare).
- **Türkçe özet:** Sunucunun ilk yanıtı ne kadar hızlı gönderdiği (TTFB). Yavaş ilk yanıt her sayfayı geciktirir; botlar yavaş siteleri daha az crawl eder. Bizim sunucumuzdan (Cloudflare) ölçülür.

#### KOD-08 · Text compression

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Text compression (br, gzip or zstd) is on.
- **Neden önemli:** Compression usually shrinks HTML, CSS and JavaScript by about 70%, so pages reach visitors and bots faster.
- **Türkçe özet:** Metin sıkıştırma (br, gzip veya zstd) açık mı? Sıkıştırma HTML, CSS ve JavaScript'i genellikle yaklaşık %70 küçültür; sayfa ziyaretçiye ve bota daha hızlı ulaşır.

#### KOD-09 · HTTP/3

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** HTTP/3 is advertised (Alt-Svc: h3).
- **Neden önemli:** HTTP/3 speeds up connections, especially on mobile and lossy networks. Note: only the header is checked.
- **Türkçe özet:** HTTP/3 duyuruluyor mu (Alt-Svc: h3)? HTTP/3 bağlantıları hızlandırır, özellikle mobil ve kayıplı ağlarda. Not: yalnızca header kontrol edilir.

#### KOD-10 · HTML size

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** The size of the home page HTML.
- **Neden önemli:** Large HTML (often inline scripts and styles) hits bots' read limits and delays first render.
- **Türkçe özet:** Ana sayfa HTML'inin boyutu. Büyük HTML (genellikle inline script/style) botların okuma limitlerine takılır ve ilk render'ı geciktirir.

#### KOD-11 · Render-blocking scripts

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** No external scripts in <head> without async or defer (render-blocking).
- **Neden önemli:** The browser does not draw the page until a blocking script in <head> is downloaded and run; first render is delayed.
- **Türkçe özet:** Head'de async veya defer olmadan harici script var mı (render-blocking)? Tarayıcı head'deki bloklayıcı script indirilip çalışana kadar sayfayı çizmez; ilk render gecikir.

#### KOD-12 · Render-blocking stylesheets

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** How many stylesheets block rendering.
- **Neden önemli:** Each blocking CSS file delays first render by another request; fewer, combined files are faster.
- **Türkçe özet:** Kaç stylesheet render'ı blokluyor? Her bloklayıcı CSS dosyası ilk render'ı bir istek daha geciktirir; daha az ve birleşik dosya daha hızlıdır.

#### KOD-13 · Third-party scripts

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** How many third-party domains load scripts.
- **Neden önemli:** Each outside domain means another connection, more delay and a privacy risk; the page depends on others' servers.
- **Türkçe özet:** Kaç üçüncü taraf domain script yüklüyor? Her dış domain ek bağlantı, gecikme ve gizlilik riski demektir; sayfa başkalarının sunucularına bağımlı olur.

#### KOD-14 · Image dimensions (width, height)

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether most images have width and height set.
- **Neden önemli:** An image without a known size makes the page shift when it loads (CLS); the browser cannot reserve space.
- **Türkçe özet:** Görsellerin çoğunda width ve height var mı? Boyutu bilinmeyen görsel yüklenirken sayfayı kaydırır (CLS); tarayıcı yer ayıramaz.

#### KOD-15 · Lazy loading

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether images after the first few use loading="lazy".
- **Neden önemli:** Loading off-screen images later lightens the first load and saves mobile data.
- **Türkçe özet:** İlk birkaç görselden sonrakiler loading=lazy mi? Ekran dışı görselleri sonra yüklemek ilk yükü hafifletir ve mobil veri tasarrufu sağlar.

#### KOD-16 · Modern image formats

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether images use modern formats such as WebP or AVIF.
- **Neden önemli:** WebP and AVIF usually deliver the same image in a 25-50% smaller file.
- **Türkçe özet:** Görseller WebP veya AVIF gibi modern formatlarda mı? WebP ve AVIF aynı görseli genellikle %25-50 daha küçük dosyayla verir.

#### KOD-17 · Web font loading

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** If a web font service is used, there is a preconnect or display=swap.
- **Neden önemli:** Preconnecting to the font server or using font-display: swap keeps text visible while fonts load.
- **Türkçe özet:** Web font servisi kullanılıyorsa preconnect veya display=swap var mı? Font sunucusuna preconnect veya font-display:swap, font yüklenirken metnin görünür kalmasını sağlar.

#### KOD-18 · Cache lifetime

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether CSS and JS files are cached for a long time.
- **Neden önemli:** A long cache lifetime saves returning visitors and bots from downloading the same files again.
- **Türkçe özet:** CSS ve JS dosyaları uzun süre cache'leniyor mu? Uzun cache ömrü dönen ziyaretçilerin ve botların aynı dosyaları tekrar indirmesini önler.

#### KOD-19 · doctype, charset and viewport

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the doctype comes first, the charset is declared early and a viewport tag exists.
- **Neden önemli:** Without viewport the page opens as a shrunken desktop page on phones (Google evaluates the phone view); doctype and an early charset make browsers read the page in the right mode and encoding.
- **Türkçe özet:** Doctype başta mı, charset erken mi bildirilmiş, viewport var mı? Viewport yoksa sayfa telefonda küçültülmüş masaüstü sayfası gibi açılır (Google telefon görünümünü değerlendirir); doctype ve erken charset doğru mod ve kodlama sağlar.

#### KOD-22 · PageSpeed accessibility

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The Google PageSpeed accessibility score.
- **Neden önemli:** An accessible page (contrast, labels, heading order) serves screen readers and bots alike.
- **Türkçe özet:** Google PageSpeed erişilebilirlik puanı. Erişilebilir sayfa (kontrast, etiketler, başlık sırası) ekran okuyuculara ve botlara birlikte hizmet eder.

#### KOD-23 · PageSpeed SEO

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The Google PageSpeed SEO score.
- **Neden önemli:** Lighthouse's basic SEO checks (crawlability, title, description, link text) add up to this score.
- **Türkçe özet:** Google PageSpeed SEO puanı. Lighthouse'un temel SEO kontrolleri (crawlability, title, description, link metni) bu puanı oluşturur.

#### KOD-24 · PageSpeed best practices

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The Google PageSpeed best practices score.
- **Neden önemli:** Checks such as HTTPS, console errors, deprecated APIs and image ratios; browser warnings reduce trust.
- **Türkçe özet:** Google PageSpeed best practices puanı. HTTPS, console hataları, eski API'ler ve görsel oranları gibi kontrolleri kapsar; tarayıcı uyarıları güveni azaltır.

#### KOD-26 · Unused JavaScript

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** How much unused JavaScript the page carries (Lighthouse).
- **Neden önemli:** Unused code is downloaded and parsed anyway, making the page needlessly heavy.
- **Türkçe özet:** Sayfanın taşıdığı kullanılmayan JavaScript miktarı (Lighthouse). Kullanılmayan kod yine indirilip parse edilir; sayfa gereksiz ağırlaşır.

#### KOD-28 · HTML download time

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the home page HTML downloads quickly.
- **Neden önemli:** Fetched from our server, the HTML took this long to complete. Slow HTML delays every page and bot crawling.
- **Türkçe özet:** Ana sayfa HTML'i hızlı indiriliyor mu? Bizim sunucumuzdan çekilen HTML bu kadar sürdü. Yavaş HTML her sayfayı ve bot crawl'ını geciktirir.

#### KOD-29 · DOM size

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** The number of DOM elements on the page (Lighthouse).
- **Neden önemli:** A large DOM raises memory use and render time; interactions slow down.
- **Türkçe özet:** Sayfadaki DOM elemanı sayısı (Lighthouse). Büyük DOM bellek ve render süresini artırır; etkileşimler yavaşlar.

#### KOD-30 · Page weight

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether the total page weight stays within what Lighthouse accepts.
- **Neden önemli:** Heavy pages are slow and costly on mobile data; the resource breakdown is in the speed section.
- **Türkçe özet:** Toplam sayfa ağırlığı Lighthouse'un kabul ettiği sınırda mı? Ağır sayfalar mobil veride yavaş ve pahalıdır; kaynak dağılımı hız bölümünde gösterilir.

#### KOD-31 · JavaScript minification

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether JavaScript is minified (Lighthouse).
- **Neden önemli:** Minifying removes whitespace and comments so files download faster.
- **Türkçe özet:** JavaScript minify edilmiş mi (Lighthouse)? Minify boşluk ve yorumları kaldırır, dosya daha hızlı iner.

#### KOD-32 · CSS minification

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether CSS is minified (Lighthouse).
- **Neden önemli:** Minified CSS downloads faster and holds up rendering less.
- **Türkçe özet:** CSS minify edilmiş mi (Lighthouse)? Minify CSS daha hızlı iner ve render'ı daha az tutar.

#### KOD-33 · Image sizing

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether images are sized for the screen (Lighthouse).
- **Neden önemli:** Downloading images larger than shown on phones wastes data and time; srcset can serve the right size.
- **Türkçe özet:** Görseller ekrana uygun boyutta mı (Lighthouse)? Telefonda gösterilenden büyük görsel indirmek veri ve zaman harcar; srcset doğru boyutu verir.

### 6.6. Yapısal veri (13 açıklanmış / 18 toplam, ağırlık 10)

JSON-LD’nin varlığı, geçerliliği, tipi ve zorunlu alanları; WebSite/Organization/Product/FAQ/Article schema’ları.

#### YAP-01 · A JSON-LD block

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The page has a schema.org JSON-LD block.
- **Neden önemli:** Structured data tells search engines and AI systems the brand name, products and accounts in machine-readable form.
- **Türkçe özet:** Sayfada schema.org JSON-LD bloğu var mı? Yapısal veri marka adı, ürünler ve hesapları makine-okunur biçimde arama motorlarına ve AI'ya söyler.

#### YAP-02 · Valid JSON

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Every JSON-LD block is valid JSON.
- **Neden önemli:** Search engines ignore a broken block entirely; everything in it is lost.
- **Türkçe özet:** Her JSON-LD bloğu geçerli JSON mu? Bozuk bloğu arama motorları tamamen yok sayar; içindeki her şey kaybolur.

#### YAP-03 · @context and @type

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Every block has a schema.org @context and every node has an @type.
- **Neden önemli:** Without @context and @type a block is not recognized as schema.org data.
- **Türkçe özet:** Her blokta schema.org @context ve her düğümde @type var mı? @context ve @type olmadan blok schema.org verisi olarak tanınmaz.

#### YAP-04 · WebSite schema

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A WebSite type exists.
- **Neden önemli:** The WebSite schema defines the site name and URL; the site name in search results comes from it.
- **Türkçe özet:** WebSite tipi var mı? WebSite schema site adını ve URL'sini tanımlar; arama sonucundaki site adı bundan gelir.

#### YAP-06 · Content-describing schema type

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Beyond identity, a type describes the content (Product, Article, Service, LocalBusiness, SoftwareApplication, FAQPage...).
- **Neden önemli:** Product, service or article schema feeds content to AI answers and rich results directly.
- **Türkçe özet:** Kimlik dışında içeriği tanımlayan tip var mı (Product, Article, Service, LocalBusiness, SoftwareApplication, FAQPage gibi)? Ürün, hizmet veya makale schema'sı AI cevaplarına ve zengin sonuçlara doğrudan içerik besler.

#### YAP-07 · Required fields in the schema

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Required fields per type are set (Product: name, price, currency; Article: headline, date, author; LocalBusiness: name, address; Event: name, date, location).
- **Neden önemli:** A schema missing required fields gets no rich result and gives AI systems half the information.
- **Türkçe özet:** Tipin zorunlu alanları dolu mu (Product: name, price, currency; Article: headline, date, author; LocalBusiness: name, address; Event: name, date, location)? Zorunlu alanı eksik schema zengin sonuç vermez ve AI'ya bilginin yarısını verir.

#### YAP-08 · FAQPage and visible text

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** FAQPage questions also appear in the visible page text (no hidden schema).
- **Neden önemli:** Google treats schema marking up invisible content as a violation. Note: the FAQ rich result is now shown only for well-known government and health sites; the schema should still match the visible text (for AI summaries and trust).
- **Türkçe özet:** FAQPage soruları görünen sayfa metninde de var mı (gizli schema yok)? Google görünmeyen içeriği schema ile işaretlemeyi ihlal sayar. Not: FAQ zengin sonucu artık yalnızca tanınmış devlet ve sağlık sitelerine gösteriliyor; schema yine görünen metinle eşleşmeli (AI özetleri ve güven için).

#### YAP-10 · Absolute URLs in the schema

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** url, sameAs, logo and image addresses in the schema are absolute and https.
- **Neden önemli:** Relative or http addresses cannot be resolved elsewhere; AI systems and search engines may not follow them.
- **Türkçe özet:** Schema'daki url, sameAs, logo ve image adresleri mutlak ve https mi? Göreli veya http adresler başka yerde çözülemez; AI ve arama motorları takip edemeyebilir.

#### YAP-11 · Organization fields

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The Organization schema has name, url and logo.
- **Neden önemli:** Name, URL and logo are the core trio of the brand card and knowledge panel.
- **Türkçe özet:** Organization schema'da name, url ve logo var mı? İsim, URL ve logo marka kartı ve knowledge panelin çekirdek üçlüsüdür.

#### YAP-13 · Schema date format

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether date fields in the schema use the ISO 8601 format.
- **Neden önemli:** A malformed date cannot be read; freshness and publish date information is lost.
- **Türkçe özet:** Schema'daki tarih alanları ISO 8601 formatında mı? Bozuk tarih okunamaz; tazelik ve yayın tarihi bilgisi kaybolur.

#### YAP-18 · WebSite name and alternateName

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** The WebSite schema has a filled name and an alternateName.
- **Neden önemli:** Google reads the site name from the WebSite schema: name is required, alternateName is optional for a short or alternative name. With both filled, the site name in results is more likely to come out right.
- **Türkçe özet:** WebSite schema'da name ve alternateName dolu mu? Google site adını WebSite schema'dan okur; name zorunlu, alternateName kısa veya alternatif ad için opsiyoneldir. İkisi doluysa sonuçtaki ad daha doğru çıkar.

#### YAP-19 · BreadcrumbList schema

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether inner pages with a path two levels deep or more carry a JSON-LD BreadcrumbList.
- **Neden önemli:** BreadcrumbList shows the page's place on the site (Home > Category > Page) in search results and tells AI systems which section the page belongs to. Google requires at least two ListItems. A trail given as microdata may not be seen here.
- **Türkçe özet:** İki seviye veya daha derin iç sayfalarda JSON-LD BreadcrumbList var mı? BreadcrumbList sayfanın sitedeki yerini (Ana, Kategori, Sayfa) arama sonucunda gösterir ve AI'ya hangi bölümde olduğunu söyler. Google en az iki ListItem ister; microdata ile verilen iz burada görülmeyebilir.

#### YAP-20 · Placeholder text in the schema

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether schema values hold an unfilled template pattern such as [Business Name] or {{ ... }}.
- **Neden önemli:** A leftover template value such as "[Business Name]" tells search engines and AI systems an empty pattern instead of the real name or address. Rich results fail, the data is read wrong and trust in the rest of the schema drops.
- **Türkçe özet:** Schema değerlerinde [Business Name] veya {{ ... }} gibi doldurulmamış şablon var mı? Kalmış şablon değeri arama motorlarına ve AI'ya gerçek adres yerine boş desen verir; zengin sonuç başarısız olur, veri yanlış okunur ve schema'nın geri kalanına güven düşer.

### 6.7. Güvenlik ve başlıklar (22 açıklanmış / 22 toplam, ağırlık 8)

HTTPS, HSTS, CSP, çerez bayrakları, SPF/DMARC/CAA/DNSSEC, gizli spam linkleri ve gizli yönlendirme izleri.

#### GUV-01 · HTTPS

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The site opens over HTTPS.
- **Neden önemli:** The home page arrives without encryption. Browsers mark it "not secure" and search engines prefer HTTPS.
- **Türkçe özet:** Site HTTPS ile mi açılıyor? Ana sayfa şifresiz geliyorsa tarayıcı 'güvenli değil' der ve arama motorları HTTPS'i tercih eder.

#### GUV-02 · HTTP to HTTPS redirect

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** http:// redirects permanently (301/308) to HTTPS.
- **Neden önemli:** Visitors and bots arriving on http:// should not stay unencrypted; a permanent redirect also tells search engines the main address.
- **Türkçe özet:** http:// kalıcı (301 veya 308) olarak HTTPS'e yönleniyor mu? http:// ile gelen ziyaretçi ve bot şifresiz kalmamalı; kalıcı yönlendirme ana adresi de bildirir.

#### GUV-03 · HSTS header

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** An HSTS (Strict-Transport-Security) header exists with a max-age of at least one year.
- **Neden önemli:** HSTS makes browsers always open the site over HTTPS; without it, or with a short lifetime, the first request may go unencrypted. Browser preload lists and web.dev ask for at least one year.
- **Türkçe özet:** HSTS (Strict-Transport-Security) header'ı var mı ve max-age en az bir yıl mı? HSTS tarayıcının siteyi her zaman HTTPS ile açmasını sağlar; yoksa veya kısa ömürlüyse ilk istek şifresiz gidebilir. Preload listeleri ve web.dev en az bir yıl ister.

#### GUV-04 · HSTS strength

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether HSTS lasts long and covers subdomains.
- **Neden önemli:** A one-year HSTS covering subdomains is required for browser preload lists and makes protection lasting.
- **Türkçe özet:** HSTS süresi uzun mu ve alt alan adlarını kapsıyor mu? Alt alan adlarını kapsayan bir yıllık HSTS, tarayıcı preload listeleri için gerekir ve korumayı kalıcı yapar.

#### GUV-05 · Content-Security-Policy

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Content-Security-Policy limits script sources: script-src or default-src exists without unsafe-inline/unsafe-eval/* (nonce, hash, strict-dynamic neutralise unsafe-inline).
- **Neden önemli:** CSP limits outside scripts being injected into the page (XSS). A CSP that only sets framing protection (frame-ancestors), or allows unsafe-inline/unsafe-eval/*, does not stop script injection.
- **Türkçe özet:** Content-Security-Policy script kaynaklarını sınırlıyor mu; script-src veya default-src var ve unsafe-inline, unsafe-eval, * yok mu? Nonce, hash ve strict-dynamic unsafe-inline'ı etkisizleştirir. CSP sayfaya dış script enjeksiyonunu (XSS) sınırlar; yalnız frame-ancestors veya unsafe-inline/unsafe-eval/* izin veren CSP script enjeksiyonunu durdurmaz.

#### GUV-06 · X-Content-Type-Options

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** X-Content-Type-Options: nosniff.
- **Neden önemli:** nosniff stops browsers from guessing file types and running them wrongly.
- **Türkçe özet:** X-Content-Type-Options: nosniff var mı? nosniff tarayıcının dosya tipini tahmin edip yanlış çalıştırmasını önler.

#### GUV-07 · Framing protection

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Framing protection: CSP frame-ancestors or X-Frame-Options.
- **Neden önemli:** Without it, the page can be shown inside another site and used for clickjacking.
- **Türkçe özet:** Çerçeve koruması var mı: CSP frame-ancestors veya X-Frame-Options? Yoksa sayfa başka sitede gösterilip clickjacking için kullanılabilir.

#### GUV-08 · Referrer-Policy

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A Referrer-Policy header exists.
- **Neden önemli:** Referrer-Policy limits how much of the visitor's address is passed to outside sites.
- **Türkçe özet:** Referrer-Policy header'ı var mı? Ziyaretçinin adresinin ne kadarının dış sitelere geçeceğini sınırlar.

#### GUV-09 · Permissions-Policy

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** A Permissions-Policy header exists.
- **Neden önemli:** Limits use of browser features such as camera, microphone and location on the page and in embeds.
- **Türkçe özet:** Permissions-Policy header'ı var mı? Kamera, mikrofon ve konum gibi tarayıcı özelliklerinin sayfada ve embed'lerde kullanımını sınırlar.

#### GUV-10 · Mixed content

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** No scripts or styles loaded over http:// on an HTTPS page.
- **Neden önemli:** Browsers block http:// scripts and styles on HTTPS pages; the page breaks and may show a "not secure" warning.
- **Türkçe özet:** HTTPS sayfada http:// ile yüklenen script veya style var mı? Tarayıcılar HTTPS sayfada http:// script ve style'ı bloklar; sayfa bozulur ve 'güvenli değil' uyarısı çıkabilir.

#### GUV-11 · Version disclosure

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Server and X-Powered-By headers do not reveal version numbers.
- **Neden önemli:** A version number makes it easier for attackers to look up known flaws in that version.
- **Türkçe özet:** Server ve X-Powered-By header'ları sürüm numarası açıklıyor mu? Sürüm numarası saldırganın o sürümdeki bilinen açıkları aramasını kolaylaştırır.

#### GUV-12 · The security.txt file

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** /.well-known/security.txt exists with Contact and a valid Expires.
- **Neden önemli:** security.txt tells people who find a vulnerability how to reach you (RFC 9116).
- **Türkçe özet:** /.well-known/security.txt var mı, Contact ve geçerli Expires içeriyor mu? security.txt açık bulan kişilere size nasıl ulaşacağını söyler (RFC 9116).

#### GUV-13 · Cookie flags

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the home page cookies carry the Secure, HttpOnly and SameSite flags.
- **Neden önemli:** A cookie without Secure can leak over plain connections; HttpOnly and SameSite make cookie theft and cross-site request forgery harder. Cookie values are not stored.
- **Türkçe özet:** Ana sayfa çerezleri Secure, HttpOnly ve SameSite taşıyor mu? Secure'siz çerez düz bağlantıda sızabilir; HttpOnly ve SameSite çerez hırsızlığı ve CSRF'i zorlaştırır. Çerez değerleri saklanmaz.

#### GUV-14 · SPF record

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The domain has exactly one SPF record (v=spf1).
- **Neden önemli:** SPF says who may send email for your domain; without it, spoofing your domain is easier. Multiple SPF records are invalid.
- **Türkçe özet:** Domainde tam olarak bir SPF kaydı (v=spf1) var mı? SPF domain adına kimin e-posta gönderebileceğini söyler; yoksa domain taklidi kolaylaşır. Birden çok SPF geçersizdir.

#### GUV-15 · DMARC record

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** DMARC record with p=quarantine or p=reject.
- **Neden önemli:** DMARC says what happens to spoofed mail failing SPF and DKIM; p=none only reports, it does not protect.
- **Türkçe özet:** DMARC kaydı p=quarantine veya p=reject mi? DMARC, SPF ve DKIM'den geçemeyen taklit e-postaya ne olacağını söyler; p=none yalnız raporlar, korumaz.

#### GUV-16 · CAA record

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** A CAA record exists (which certificate authorities may issue).
- **Neden önemli:** CAA lets only authorities you allow issue certificates for your domain, reducing mis-issuance risk.
- **Türkçe özet:** CAA kaydı var mı (hangi sertifika otoriteleri verebilir)? CAA yalnız izin verdiğiniz otoritelerin domain için sertifika vermesini sağlar; yanlış sertifika riskini azaltır.

#### GUV-17 · DNSSEC

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** DNSSEC validates (AD flag in the resolver answer).
- **Neden önemli:** DNSSEC stops DNS answers being altered in transit, so visitors cannot be sent to a fake server.
- **Türkçe özet:** DNSSEC doğrulanıyor mu (resolver yanıtında AD flag)? DNSSEC DNS yanıtlarının yolda değiştirilmesini önler; ziyaretçi sahte sunucuya gönderilemez.

#### GUV-18 · rel="noopener"

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** External links opening in a new tab have rel="noopener" or "noreferrer".
- **Neden önemli:** Without noopener, the opened page can redirect your tab elsewhere in older browsers (tabnabbing).
- **Türkçe özet:** Yeni sekmede açılan dış linklerde rel=noopener veya rel=noreferrer var mı? noopener yoksa açılan sayfa eski tarayıcılarda sekmenizi başka yere yönlendirebilir (tabnabbing).

#### GUV-19 · Plain-text email address

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** No plain-text email address in the visible text (addresses are not stored, only counted).
- **Neden önemli:** Plain-text addresses are harvested by spam bots; a contact form or obfuscated link is safer.
- **Türkçe özet:** Görünür metinde düz e-posta adresi var mı? Adresler saklanmaz, yalnız sayılır. Düz adresleri spam botları toplar; iletişim formu veya gizlenmiş link daha güvenlidir.

#### GUV-20 · Hidden spam links

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether a hidden block on the page holds outbound links with spam terms such as betting, casino or pills, or many different outside domains (a sign of a hacklink attack).
- **Neden önemli:** In a hacklink attack the attacker plants hidden links in your site's code; visitors do not see them but search engines do. They usually point to illegal betting, casino, pharmacy or adult sites. Without knowing it, you become a spam source and Google may penalise you.
- **Türkçe özet:** Gizli bir blokta bahis, casino, hap gibi spam terimleriyle dış linkler veya çok farklı dış domain var mı? Bu, hacklink saldırısı işaretidir: saldırgan site koduna gizli linkler koyar; ziyaretçi görmez, arama motoru görür. Genellikle yasa dışı bahis, casino, eczane veya yetişkin sitelerine gider. Farkında olmadan spam kaynağı olursunuz ve Google cezalandırabilir.

#### GUV-21 · Hidden keyword stuffing

- **Tür:** Possible issue · **Kanıt:** Inferred
- **Ne ölçüyor:** Whether a hidden block on the page holds a long text that repeats the same words (keyword stuffing).
- **Neden önemli:** Text that visitors cannot see but search engines read, repeating the same words, breaks Google's hidden text and keyword stuffing rules (spam policy). An old SEO practice, a theme or a compromised file may have placed it. The check is heuristic; legitimate hidden content may rarely be flagged.
- **Türkçe özet:** Gizli bir blokta aynı kelimeleri tekrarlayan uzun metin var mı (keyword stuffing)? Ziyaretçinin görmediği ama arama motorunun okuduğu, aynı kelimeleri tekrarlayan metin Google'ın gizli metin ve keyword stuffing kurallarını ihlal eder. Eski bir SEO uygulaması, tema veya ele geçirilmiş dosya koymuş olabilir. Kontrol sezgiseldir; nadiren meşru gizli içerik de işaretlenebilir.

#### GUV-22 · Conditional redirect trace

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether the raw HTML has a meta refresh to another domain or a script that sends visitors arriving from a search engine to another domain (a sign of a hidden redirect).
- **Neden önemli:** Redirects that send visitors arriving from Google to another site, or automatically move the page to another domain, are a typical trace of a hacklink attack; showing bots one page and visitors another (cloaking) breaks Google's spam policy. Unless it is a deliberate domain move, the site may be compromised.
- **Türkçe özet:** Ham HTML'de başka domaine meta refresh veya arama motorundan gelen ziyaretçiyi başka domaine gönderen script var mı? Google'dan geleni başka siteye gönderen veya sayfayı otomatik başka domaine taşıyan yönlendirmeler hacklink saldırısının tipik izidir; botlara başka, ziyaretçiye başka sayfa göstermek (cloaking) Google spam politikasını ihlal eder. Bilinçli domain taşıma değilse site ele geçirilmiş olabilir.

### 6.8. Paylaşım (10 açıklanmış / 10 toplam, ağırlık 5)

Sosyal paylaşım kartları: og:title/description/image/url, twitter:card, favicon ve web app manifest.

#### PAY-01 · og:title

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** An og:title tag exists.
- **Neden önemli:** The title shown when the link is shared on social media or in chat comes from this tag.
- **Türkçe özet:** og:title etiketi var mı? Sosyal medyada veya sohbette link paylaşıldığında görünen başlık bu etiketten gelir.

#### PAY-02 · og:description

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** An og:description tag exists.
- **Neden önemli:** The description under a shared link comes from this tag.
- **Türkçe özet:** og:description var mı? Paylaşılan linkin altındaki açıklama bu etiketten gelir.

#### PAY-03 · og:image

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** An og:image tag exists.
- **Neden önemli:** Share cards without an image get fewer clicks; some AI interfaces also use it on source cards.
- **Türkçe özet:** og:image var mı? Görselsiz paylaşım kartları daha az tıklanır; bazı AI arayüzleri kaynak kartında bunu kullanır.

#### PAY-04 · og:image loading and size

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** Whether og:image opens and is large enough for a share card.
- **Neden önemli:** An image that does not open leaves the card empty; below 1200×630 it shows blurry or as a small card.
- **Türkçe özet:** og:image açılıyor ve paylaşım kartı için yeterince büyük mü? Açılmayan görsel kartı boş bırakır; 1200x630 altı bulanık veya küçük kart gösterir.

#### PAY-05 · og:url

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** og:url is the same address as the canonical.
- **Neden önemli:** Shares accumulate on og:url; if it differs from the canonical, share signals go to another address.
- **Türkçe özet:** og:url canonical ile aynı adres mi? Paylaşımlar og:url'de birikir; canonical'dan farklıysa paylaşım sinyalleri başka adrese gider.

#### PAY-06 · og:type, og:site_name and og:locale

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** og:type, og:site_name and og:locale exist.
- **Neden önemli:** These tags state the content type, site name and language; cards and AI source displays become more accurate.
- **Türkçe özet:** og:type, og:site_name ve og:locale var mı? Bu etiketler içerik tipini, site adını ve dili söyler; kartlar ve AI kaynak gösterimi daha doğru olur.

#### PAY-07 · twitter:card

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A twitter:card tag exists.
- **Neden önemli:** This tag sets how a link shared on X looks; without it, a small card may be shown.
- **Türkçe özet:** twitter:card etiketi var mı? X'te paylaşılan linkin nasıl görüneceğini belirler; yoksa küçük kart gösterilebilir.

#### PAY-08 · twitter:image

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** A twitter:image tag exists.
- **Neden önemli:** X usually falls back to og:image, but no image cropped for X is given. Without og:image too, the card has no image.
- **Türkçe özet:** twitter:image var mı? X genellikle og:image'a düşer ama X için kırpılmış görsel verilmez. og:image da yoksa kart görselsiz kalır.

#### PAY-09 · Favicon and apple-touch-icon

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The site icon (favicon) opens and an apple-touch-icon is defined.
- **Neden önemli:** The icon shows the brand in tabs, bookmarks, search results and AI answer source lists.
- **Türkçe özet:** Site ikonu (favicon) açılıyor ve apple-touch-icon tanımlı mı? İkon markayı sekmelerde, yer imlerinde, arama sonuçlarında ve AI kaynak listelerinde gösterir.

#### PAY-10 · Web app manifest

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** A web app manifest (link rel=manifest) and theme-color exist.
- **Neden önemli:** A manifest and theme color let the site be added like an app on phones and tint the browser bar in brand color.
- **Türkçe özet:** Web app manifest (link rel=manifest) ve theme-color var mı? Manifest ve tema rengi sitenin telefona uygulama gibi eklenmesini ve tarayıcı çubuğunun marka renginde görünmesini sağlar.

### 6.9. Dil ve hreflang (6 açıklanmış / 9 toplam, ağırlık 4)

Dil etiketi, dil kodunun metinle uyumu, hreflang x-default, geçerli kodlar ve self-reference.

#### ULU-01 · The html lang attribute

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The <html> tag has a lang attribute.
- **Neden önemli:** The language lets search engines and screen readers handle the page correctly; AI answers pick sources in the right language.
- **Türkçe özet:** html etiketinde lang var mı? Dil, arama motorları ve ekran okuyucuların sayfayı doğru işlemesini sağlar; AI cevapları doğru dildeki kaynakları seçer.

#### ULU-02 · Language code and text language

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** lang is a valid language code and matches the text language (detection for Turkish and English).
- **Neden önemli:** A wrong language code makes the page show up in searches and AI answers for the wrong language.
- **Türkçe özet:** lang geçerli bir dil kodu mu ve metnin diliyle uyuşuyor mu (Türkçe/İngilizce tespiti)? Yanlış dil kodu sayfanın yanlış dildeki aramalarda ve AI cevaplarında çıkmasına yol açar.

#### ULU-03 · hreflang x-default

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** If hreflang is used, x-default is present.
- **Neden önemli:** No default page (x-default) is declared for visitors whose language does not match.
- **Türkçe özet:** hreflang kullanılıyorsa x-default var mı? Dili eşleşmeyen ziyaretçiler için varsayılan sayfa (x-default) tanımlanmamıştır.

#### ULU-04 · hreflang codes

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** hreflang codes are valid (language, optional region: tr, en-GB, x-default).
- **Neden önemli:** Google ignores invalid hreflang codes (e.g. "en-UK" should be "en-GB").
- **Türkçe özet:** hreflang kodları geçerli mi (dil, opsiyonel bölge: tr, en-GB, x-default)? Google geçersiz hreflang kodlarını yok sayar; örneğin en-UK yerine en-GB olmalıdır.

#### ULU-07 · og:locale match

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** og:locale states the same language as the page lang.
- **Neden önemli:** If the share card language contradicts the page language, platforms may display it in the wrong language.
- **Türkçe özet:** og:locale sayfa lang'iyle aynı dili mi söylüyor? Paylaşım kartı dili sayfa diliyle çelişirse platformlar yanlış dilde gösterebilir.

#### ULU-08 · hreflang self-reference

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** The hreflang set includes the page's own address (self-reference).
- **Neden önemli:** Google expects each language version to list itself in its hreflang set; otherwise the group may be treated as incomplete.
- **Türkçe özet:** hreflang seti sayfanın kendi adresini de içeriyor mu (self-reference)? Google her dil sürümünün kendisini hreflang setinde listelemesini bekler; yoksa grup eksik sayılabilir.

### 6.10. Uygulama bağlantıları (6 açıklanmış / 6 toplam, ağırlık 7)

Uygulama varsa iOS/Android universal/app link dosyaları, Smart App Banner ve uygulama schema’sı. Uygulama yoksa uygulanamaz.

#### APP-02 · apple-app-site-association

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** If there is an iOS app, apple-app-site-association is valid JSON with applinks (universal links).
- **Neden önemli:** Without this file, site links do not open the app on iPhone; users and search traffic cannot hand over to the app.
- **Türkçe özet:** iOS uygulaması varsa apple-app-site-association geçerli JSON ve applinks (universal links) içeriyor mu? Bu dosya olmadan iPhone'da site linkleri uygulamada açılmaz; kullanıcı ve arama trafiği uygulamaya geçemez.

#### APP-03 · assetlinks.json

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** If there is an Android app, assetlinks.json is valid with package_name and sha256_cert_fingerprints (App Links).
- **Neden önemli:** Without this file, site links do not open the app on Android in a verified way.
- **Türkçe özet:** Android uygulaması varsa assetlinks.json geçerli mi; package_name ve sha256_cert_fingerprints (App Links) içeriyor mu? Bu dosya olmadan Android'de site linkleri doğrulanmış biçimde uygulamada açılmaz.

#### APP-04 · Smart App Banner

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** If there is an iOS app, a Smart App Banner (apple-itunes-app meta) exists.
- **Neden önemli:** The banner atop the site in Safari moves visitors to the app with one tap.
- **Türkçe özet:** iOS uygulaması varsa Smart App Banner (apple-itunes-app meta) var mı? Safari'de sitenin üstündeki banner ziyaretçiyi tek dokunuşla uygulamaya geçirir.

#### APP-05 · App Links meta tags

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** If there is an app, App Links meta tags (al:ios:url, al:android:package) exist.
- **Neden önemli:** These tags help shared links open in the app and app content get indexed.
- **Türkçe özet:** Uygulama varsa App Links meta etiketleri (al:ios:url, al:android:package) var mı? Bu etiketler paylaşılan linklerin uygulamada açılmasına ve uygulama içeriğinin indekslenmesine yardım eder.

#### APP-06 · App schema

- **Tür:** Opportunity · **Kanıt:** Inferred
- **Ne ölçüyor:** If there is an app, a SoftwareApplication/MobileApplication schema with operatingSystem and offers.
- **Neden önemli:** An app schema gives the app name, platform and price to AI answers and search results.
- **Türkçe özet:** Uygulama varsa operatingSystem ve offers içeren SoftwareApplication veya MobileApplication schema var mı? Uygulama schema'sı AI cevaplarına ve arama sonuçlarına uygulama adı, platform ve fiyat bilgisini verir.

#### APP-09 · apple-app-site-association paths

- **Tür:** Issue · **Kanıt:** Observed
- **Ne ölçüyor:** apple-app-site-association defines paths or components.
- **Neden önemli:** Without paths, it is unclear which site addresses open in the app; deep links do not work.
- **Türkçe özet:** apple-app-site-association paths veya components tanımlıyor mu? Paths olmadan hangi site adreslerinin uygulamada açılacağı belirsizdir; deep link'ler çalışmaz.

## 7. Kendi scannerimiz için notlar

1. **Veri kaynakları:** DNS, ana sayfa HTML, robots.txt, sitemap, llms.txt, örnek sayfalar, HTTP header’ları ve PageSpeed/CrUX. Başlangıç için JavaScript çalıştırmayan bir crawler yeterli; çünkü AI botlarının çoğu JS çalıştırmıyor.
2. **AI bot testi:** İstekleri gerçek bot user-agent’ıyla atmak tek başına yeterli değil; gerçek bot IP doğrulaması yapılamıyorsa sonucu “kesin engel” değil, “olası engel” olarak işaretle.
3. **Çıktı modeli:** Ruescan’in solid/partial/open/not measured/not applicable modeli iyi bir temel. Ölçülemeyeni cezalandırma; “provisional” göster.
4. **Kapılar:** Ana sayfa açılmıyor, noindex, tüm AI botları kapalı, HTML’de 50 kelimeden az metin, HTTPS yok gibi durumlarda puanı tavanla. Bu, skorun yanıltıcı yüksek çıkmasını engeller.
5. **GEO ayrımı:** Klasik SEO kontrolü ile GEO kontrolünü aynı kefeye koyma. AI bot erişimi, ham HTML’de metin, entity/schema, soru-cevap blokları ve alıntılanabilir yapı GEO’nun çekirdeği.
6. **Gizlilik:** IP’yi kalıcı saklama; rate-limit için kısa ömürlü anahtar kullan. Sayfa metnini ve kişisel verileri saklama. Bulguları 90 gün gibi sınırlı tut.
7. **Rate limit:** Ruescan eski sürümde aynı bağlantıdan dakikada 3 tarama ve günlük site limiti uyguluyordu; kendi scannerimizda benzerini baştan koy.

## 8. Kaynak ve doğrulama

- Sözlük: https://ruesandora.com/glossary
- Puanlama: https://ruesandora.com/how-ruescan-scores
- Eski araç sayfası (11 Ekim 2026 oturum kaydı): https://ruesandora.com/tools/site-check
- Güncel durum: `/tools/site-check` → 301 → `https://ruesandora.com/?bekleme=ac`
- Bekleme listesi API: https://ruesandora.com/api/bekleme/ayar (`acik: true`)

> Bu dosya Ruescan’in açık dokümantasyonundan derlenmiştir. 172 sinyalin adı, türü, kanıt düzeyi ve ölçüm açıklaması kaynaktan alınmıştır; Türkçe kategori özetleri ve yorumlar bu proje için eklenmiştir. Ruescan’in açıklamadığı 26 sinyal bu dosyada yoktur.

