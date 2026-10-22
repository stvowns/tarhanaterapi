# P0 — İndeks, Dizin ve Dış Profil TODO

**Tarih:** 22 Ekim 2026  
**Kararlar:** 420+ yorum gerçek değil; altı yorum kalacak, “doğrulanmış” ifadesi kaldırılacak. 0850 302 82 74 iptal edilecek. “21 gün fermantasyon” anlatısı kullanılmayacak.

---

## A. Benim yaptıklarım (kod ve yayın)

- [x] 420+, 4.9/5, %99.4, “Doğrulanmış Yorum/Alıcı” ifadeleri kaldırıldı.
- [x] Altı yorum korundu; yorum kartlarında yalnızca ad, şehir ve yorum metni var.
- [x] Ürün sayfası, ürün kartı ve hızlı inceleme modalındaki statik 4.9/420 kaldırıldı.
- [x] 0850 302 82 74; schema, `llms.txt`, `llms-full.txt`, `auth.md`, `security.txt`, KVKK, mesafeli satış, e-kitap üreticisi ve statik JSON-LD’den kaldırıldı.
- [x] `CONTENT_UPDATED` ve sitemap `lastmod` 22 Ekim 2026’ya çekildi.
- [x] `llms.txt` ve `llms-full.txt` içine “toplu yorum sayısı/ortalama puan/doğrulanmış alıcı iddiası yayınlanmaz” notu eklendi.
- [x] `npm run lint` ve `npm run build` başarılı.
- [x] `./seo-check.sh` canlı kontrol scripti eklendi.
- [ ] Deploy sonrası `./seo-check.sh` ile canlı kontrol.
- [ ] Deploy sonrası `npm run indexnow` ile 13 URL’yi IndexNow’a gönderme.

> Not: Deploy, commit/push sonrası Cloudflare Pages auto-deploy ile yapılacak.

---

## B. Google Search Console — senin yapman gerekenler

### B1. Doğru property’yi aç

1. https://search.google.com/search-console adresine gir.
2. `tarhanaterapi.com` property’sini seç. (DNS TXT doğrulaması mevcut.)
3. Sol menüde **URL Inspection / URL Denetimi**’ni aç.

### B2. 13 güncel URL için tek tek “Request Indexing”

Her URL’yi URL Inspection kutusuna yapıştır, sonucu bekle, **Request Indexing**’e bas:

```text
https://tarhanaterapi.com/
https://tarhanaterapi.com/urunler/tarhana-classic
https://tarhanaterapi.com/icerik
https://tarhanaterapi.com/hikaye
https://tarhanaterapi.com/yorumlar
https://tarhanaterapi.com/iletisim
https://tarhanaterapi.com/kvkk
https://tarhanaterapi.com/rehber
https://tarhanaterapi.com/rehber/tarhana-nasil-kurutulur
https://tarhanaterapi.com/rehber/bebeklere-tarhana-ne-zaman-verilir
https://tarhanaterapi.com/rehber/tarhana-neden-eksir
https://tarhanaterapi.com/rehber/ev-tarhanasi-ile-hazir-tarhana-farki
https://tarhanaterapi.com/rehber/katkisiz-tarhana-nasil-anlasilir
```

Notlar:

- “URL is on Google” dese bile **Request Indexing** yap; güncel sürümün taranmasını hızlandırır.
- Günlük kota vardır; hepsini tek seferde yapamazsan 2–3 güne böl.
- `Request Indexing` sıralamayı garanti etmez; yalnızca taramayı hızlandırır.

### B3. Eski URL’ler için “Remove Outdated Content”

Sol menü → **Removals / Kaldırmalar** → **New request / Yeni talep** → **Remove outdated content / Eski içeriği kaldır**.

Şu URL’leri tek tek gir:

```text
https://tarhanaterapi.com/urunler/tarhana-baby
https://tarhanaterapi.com/urunler/tarhana-spicy
https://tarhanaterapi.com/urunler/tarhana-family-pack
https://tarhanaterapi.com/urunler/tarhana-starter-set
https://tarhanaterapi.com/urunler/tarhana-gourmet-duo
https://tarhanaterapi.com/urunler
```

Notlar:

- “Temporary removal / Geçici kaldırma” kullanma; 301 ile yönlenen sayfaları tamamen gizlemek istemiyoruz.
- Google “URL is not on Google” veya “Redirect” derse sorun yok; 301 zaten doğru. Bu durumda bekle ve tekrar kontrol et.
- Eski snippet’ler 301’e rağmen 3–7 gün, bazen 2–4 hafta kalabilir.

### B4. Sitemap’i yeniden gönder

Sol menü → **Sitemaps** → `https://tarhanaterapi.com/sitemap.xml` → Submit.

`lastmod` artık 22 Ekim 2026. Sitemap’te 13 URL var.

### B5. 3–7 gün sonra kontrol

- **Pages / Sayfalar** → “Not indexed / Dizine eklenmemiş” filtresi.
- **URL Inspection** ile ürün ve ana sayfayı tekrar kontrol et.
- **Performance / Performans** → son 28 gün → “Queries / Sorgular” → `Orhangazi tarhana`, `tarhana satın al`, `bebek tarhanası` var mı?
- `site:tarhanaterapi.com` ve `"TarhanaTerapi" 450 TL` aramalarını tekrar yap.

---

## C. Bing Webmaster — ChatGPT/Copilot için kritik

### C1. Siteyi ekle

1. https://www.bing.com/webmasters adresine gir.
2. **Add site / Site ekle** → `https://tarhanaterapi.com`.
3. En kolay yol: **Import from Google Search Console / Google Search Console’dan içe aktar**. Google hesabınla yetki ver.
4. İçe aktarma çalışmazsa iki seçenek:
   - **DNS TXT**: Bing’in verdiği değeri Cloudflare DNS’e `TXT` olarak ekle.
   - **XML dosyası**: Bing’in verdiği `BingSiteAuth.xml` dosyasını `public/BingSiteAuth.xml` olarak ekle; sonra commit/push. Token gizli değildir, dosya herkese açık olur.

### C2. Sitemap ve URL gönderimi

1. **Sitemaps** → `https://tarhanaterapi.com/sitemap.xml` → Submit.
2. **URL Submission / URL Gönderimi** → 13 güncel URL’yi gönder.
3. **IndexNow**:
   - Deploy sonrası ben `npm run indexnow` çalıştıracağım.
   - Alternatif olarak Bing Webmaster’daki **IndexNow** bölümünden anahtarın canlı olduğunu doğrula:
     `https://tarhanaterapi.com/11b92a56bf582414420a4ab1735edb24.txt`

### C3. 3–7 gün sonra kontrol

- **Site Explorer** → URL’ler “Indexed” mi?
- **URL Inspection** → ürün sayfası ve ana sayfa.
- Bing’de `site:tarhanaterapi.com` ara.
- ChatGPT/Copilot’a “TarhanaTerapi fiyatı nedir?” diye sor; cevap 500 TL mi, 450 TL mi?

---

## D. Google Business Profile — yerel görünürlük

https://business.google.com/ sayfasını açtın. Adımlar:

### D1. İşletme bilgileri

1. **Add business / İşletme ekle**.
2. İşletme adı: **TarhanaTerapi** (anahtar kelime ekleme yok).
3. Kategori: **Gıda üreticisi / Food producer**. Bu yoksa **Gıda ürünleri mağazası** veya **Baharatçı** seç; restoran/kafe seçme.
4. Adres: **Muradiye Mh., Orhangazi / Bursa**.
5. “Müşteriler işletmeye geliyor mu?”:
   - Atölyeye müşteri gelmiyorsa **Hayır** seç, hizmet bölgesi olarak **Orhangazi, Bursa** ve çevresini ekle.
   - Müşteri geliyorsa **Evet** seç; adres haritada görünür.
6. Telefon: **0850 iptal.** Gerçek cep/telefon varsa onu yaz. Yoksa telefon alanını boş bırak; doğrulamayı web sitesi/e-posta ile dene.
7. Web sitesi: `https://tarhanaterapi.com/`
8. Instagram: `https://www.instagram.com/tarhanaterapi/`
9. Çalışma saatleri: **Pazartesi–Cumartesi 09:00–18:30** (schema ile aynı).
10. Açıklama (kopyala-yapıştır):

```text
TarhanaTerapi, Bursa Orhangazi'de aile tarifiyle katkısız geleneksel tarhana üreten bir aile işletmesidir. 1 kg pamuk torba geleneksel tarhana 500 TL'dir. Türkiye geneli 1-3 iş gününde kargo; 2000 TL üzeri siparişlerde ücretsiz.
```

### D2. Doğrulama

- Google’ın verdiği yöntemi seç: **video doğrulama** genellikle en hızlısı.
- Videoda göster: atölye, üretim malzemeleri, tarhana, paketleme, varsa tabela/araç.
- Doğrulama birkaç gün sürebilir; bu sırada bilgileri değiştirme.

### D3. Doğrulandıktan sonra

- **Products / Ürünler**: “Geleneksel Tarhana 1 kg — 500 TL”; eski 450 TL’yi yazma.
- Fotoğraf: ürün, atölye, paketleme, malzemeler; stok fotoğraf kullanma.
- **Posts / Gönderiler**: haftada 1 üretim/fotoğraf.
- **Q&A**: “Fiyat 500 TL”, “1 kg”, “kargo 1-3 gün”, “katkısız” cevaplarını ekle.
- **Reviews**: gerçek müşterilerden yorum iste; teşvik/hediye karşılığı yorum isteme. Yorumlara cevap ver.
- Google Maps işletme linkini bana gönder; `sameAs` alanına ekleyeyim.

---

## E. Bing Places, Apple, Yandex ve yerel kayıtlar

- [ ] **Bing Places**: https://www.bingplaces.com/ → Google Business Profile’dan içe aktar veya elle ekle.
- [ ] **Apple Business Connect**: https://businessconnect.apple.com/ → işletme ekle; adres/kategori/website aynı.
- [ ] **Yandex Business**: https://business.yandex.com/ → site Yandex’te doğrulanmış; işletme kaydı ekle.
- [ ] **Yerel kayıt**: Orhangazi/Bursa esnaf odası, yerel gıda rehberi, kadın girişimi/kooperatif listesi (üyelik uygunsa).
- [ ] Tüm kayıtlarda **aynı NAP**: TarhanaTerapi + Muradiye Mh., Orhangazi / Bursa + gerçek telefon + `satis@tarhanaterapi.com`.

---

## F. Instagram ve dış profiller

### F1. Instagram bio

Önerilen bio:

```text
TarhanaTerapi · Bursa Orhangazi
Katkısız, güneşte kurutulmuş geleneksel tarhana
1 kg 500 TL · Türkiye geneli kargo
🔗 tarhanaterapi.com/urunler/tarhana-classic
```

Kaldırılacaklar:

- 450 TL
- 21 gün / toprak küp / fermantasyon
- 420+ doğrulanmış yorum / 4.9 puan
- Eski Gedelek adresi
- 0850 telefon
- “İstanbul tadım noktası”

### F2. Diğer dış profiller

- [ ] Facebook sayfası: fiyat, adres, telefon, üretim anlatısı.
- [ ] WhatsApp Business profili: 0850 yerine gerçek numara; açıklama 500 TL.
- [ ] E-posta imzası: 0850’yi kaldır.
- [ ] Fatura/irsaliye/paket etiketi: 0850’yi kaldır.
- [ ] Varsa Trendyol/Hepsiburada/Etsy vb. ilanlar: 450 TL ve 21 gün metnini güncelle veya ilanı kapat.
- [ ] Eski PDF/e-kitap: yeni PDF’de 0850 olmayacak; deploy sonrası kontrol et.
- [ ] Google’a eski bilgiyi yayan üçüncü taraf siteler: varsa iletişime geç ve güncelle.

---

## G. 3–7 gün sonra yapılacak kontrol

1. `./seo-check.sh` çalıştır.
2. Google’da:
   - `site:tarhanaterapi.com`
   - `"TarhanaTerapi" 450 TL`
   - `"TarhanaTerapi" 21 gün`
   - `TarhanaTerapi 500 TL`
   - `Orhangazi tarhana satın al`
3. Bing’de aynı sorgular.
4. ChatGPT/Copilot/Perplexity/Gemini’ye şu soruları sor:
   - “TarhanaTerapi nedir?”
   - “TarhanaTerapi 1 kg fiyatı ne kadar?”
   - “TarhanaTerapi güvenilir mi?”
   - “Orhangazi’de katkısız tarhana nereden alınır?”
5. Cevap 450 TL / 21 gün diyorsa:
   - GSC/Bing’de URL’yi tekrar Request Indexing yap.
   - Eski URL için Remove Outdated Content tekrar dene.
   - Dış profildeki eski bilgiyi bul ve düzelt.

---

## H. Sonraki içerik işleri (P1)

- [ ] Ürün sayfasına rehber linkleri.
- [ ] Bebek/gıda güvenliği rehberlerine kaynakça.
- [ ] “Orhangazi tarhana” yerel sayfası.
- [ ] “21 gün fermantasyon yok” SSS’i.
- [ ] 5–10 bağımsız üçüncü taraf atıf.
- [ ] AI cevap ölçüm seti (20–30 soru).
