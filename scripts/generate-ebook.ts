/**
 * E-kitap PDF üretici.
 *
 * Kullanım: npm run ebook
 * Gereksinim: sistemde Google Chrome (veya CHROME_BIN ile yol).
 *
 * Kaynak tarifler: src/data/mockData.ts -> RECIPES_EBOOK
 * Çıktı: public/kadim-corba-rituelleri-ve-sifali-tarifler.pdf
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPES_EBOOK } from '../src/data/mockData';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outputPdf = path.join(root, 'public', 'kadim-corba-rituelleri-ve-sifali-tarifler.pdf');
const coverPath = path.join(root, 'public', 'images', 'urun-klasik.webp');

const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const coverBase64 = fs.readFileSync(coverPath).toString('base64');

const recipePage = (recipe: (typeof RECIPES_EBOOK)[number], index: number) => `
  <section class="page recipe-page">
    <div class="recipe-head">
      <div class="kicker">Reçete ${String(index + 1).padStart(2, '0')}</div>
      <h2>${esc(recipe.title)}</h2>
      <p class="subtitle">${esc(recipe.subtitle)}</p>
      <div class="meta">
        <span><b>Hazırlık</b>${esc(recipe.prepTime)}</span>
        <span><b>Porsiyon</b>${esc(recipe.servings)}</span>
        <span><b>Zorluk</b>${esc(recipe.difficulty)}</span>
      </div>
    </div>
    <div class="recipe-body">
      <div class="ingredients">
        <h3>Malzemeler</h3>
        <ul>${recipe.ingredients.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
      </div>
      <div class="steps">
        <h3>Adım Adım Hazırlanışı</h3>
        <ol>${recipe.steps
          .map(
            (step, stepIndex) =>
              `<li><span class="num">${stepIndex + 1}</span><span>${esc(step)}</span></li>`
          )
          .join('')}</ol>
      </div>
    </div>
    <div class="chef-note">
      <div class="chef-title">Şifa Püf Noktası</div>
      <p>${esc(recipe.chefNote)}</p>
    </div>
    ${
      recipe.servingIdea
        ? `<div class="serving-note">
            <div class="serving-title">Sunum Önerisi</div>
            <p>${esc(recipe.servingIdea)}</p>
          </div>`
        : ''
    }
    <div class="page-footer">TarhanaTerapi · Kadim Çorba Ritüelleri ve Şifalı Tarifler</div>
  </section>`;

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif; color: #2b2b2b; background: #fff; }
  .page { width: 210mm; height: 297mm; page-break-after: always; position: relative; overflow: hidden; background: #fffdf9; }
  .page:last-child { page-break-after: auto; }
  h1,h2,h3 { font-family: "DejaVu Serif", Georgia, serif; margin: 0; }

  /* Kapak */
  .cover { color: #fff; background: #1f3b2a; }
  .cover-img { position:absolute; inset:0; background-image: linear-gradient(180deg, rgba(18,40,28,.28) 0%, rgba(18,40,28,.72) 60%, rgba(18,40,28,.94) 100%), url(data:image/webp;base64,${coverBase64}); background-size: cover; background-position: center; }
  .cover-inner { position:relative; z-index:2; height:100%; padding: 24mm 22mm; display:flex; flex-direction:column; justify-content:space-between; }
  .brand { font-size: 12pt; letter-spacing: 3px; text-transform: uppercase; font-weight: bold; color:#f2e6c9; }
  .cover h1 { font-size: 38pt; line-height: 1.05; margin-top: 8mm; color:#fff; }
  .cover .sub { font-size: 14pt; color:#e9ddc2; margin-top: 6mm; max-width: 135mm; line-height:1.5; }
  .cover-bottom { border-top: 1px solid rgba(255,255,255,.35); padding-top: 6mm; font-size: 9.5pt; color:#e9ddc2; line-height:1.7; }
  .badge { display:inline-block; background:#c9a227; color:#1f2d20; font-size:9pt; font-weight:bold; padding:2mm 4mm; border-radius:20px; letter-spacing:1px; }

  /* İç sayfalar */
  .content { padding: 22mm 20mm; }
  .kicker { font-size: 9pt; letter-spacing: 2.5px; text-transform: uppercase; color:#a07d1c; font-weight:bold; }
  h2 { font-size: 24pt; color:#31523c; margin-top: 3mm; line-height:1.15; }
  .subtitle { color:#6b665e; font-size: 11pt; margin: 3mm 0 0; }
  .intro { font-size: 10.5pt; line-height: 1.8; color:#3d3a35; margin-top: 8mm; }
  .quote { margin: 10mm 0; padding: 7mm 8mm; background:#f3f7f1; border-left: 3px solid #31523c; font-family:"DejaVu Serif", Georgia, serif; font-size: 12pt; line-height:1.7; color:#31523c; }
  .section-title { font-size: 16pt; color:#31523c; margin: 10mm 0 4mm; }
  .three { display:flex; gap: 6mm; margin-top: 6mm; }
  .card { flex:1; background:#fff; border:1px solid #e8e2d9; border-radius: 4mm; padding: 6mm; }
  .card h3 { font-size: 11pt; color:#31523c; margin-bottom:2mm; }
  .card p { font-size: 9.5pt; line-height:1.65; color:#555; margin:0; }

  /* Reçete */
  .recipe-page { padding: 18mm 20mm 20mm; }
  .recipe-head { border-bottom: 2px solid #31523c; padding-bottom: 5mm; }
  .recipe-head h2 { font-size: 21pt; }
  .meta { display:flex; gap: 4mm; margin-top: 4mm; }
  .meta span { flex:1; background:#f3f7f1; border-radius:3mm; padding:2.5mm 4mm; font-size:9pt; color:#4a4a4a; }
  .meta b { display:block; font-size:7.5pt; text-transform:uppercase; letter-spacing:1px; color:#7a746b; margin-bottom:1mm; }
  .recipe-body { display:flex; gap: 8mm; margin-top: 6mm; }
  .ingredients { width: 61mm; flex-shrink:0; }
  .steps { flex:1; }
  .recipe-body h3 { font-size: 12pt; color:#31523c; margin-bottom: 3mm; }
  .ingredients ul { margin:0; padding:0; list-style:none; }
  .ingredients li { font-size: 9.3pt; line-height:1.55; padding: 2.2mm 0; border-bottom:1px dashed #e8e2d9; color:#3d3a35; }
  .ingredients li:before { content:"•"; color:#c9a227; font-weight:bold; margin-right:2mm; }
  .steps ol { margin:0; padding:0; list-style:none; }
  .steps li { display:flex; gap:3mm; font-size:9.3pt; line-height:1.6; margin-bottom:3.4mm; color:#3d3a35; }
  .num { flex-shrink:0; width:7mm; height:7mm; border-radius:50%; background:#31523c; color:#fff; font-size:8.5pt; font-weight:bold; display:flex; align-items:center; justify-content:center; }
  .chef-note { margin-top: 5mm; background:#fbf5e6; border:1px solid #ead9a8; border-radius:3mm; padding:4mm 6mm; }
  .chef-title, .serving-title { font-size:8pt; text-transform:uppercase; letter-spacing:1.5px; font-weight:bold; color:#a07d1c; margin-bottom:1.5mm; }
  .chef-note p, .serving-note p { margin:0; font-size:9.3pt; line-height:1.6; color:#4a4a4a; }
  .serving-note { margin-top: 3.5mm; background:#eef4ee; border:1px solid #cfe0cc; border-radius:3mm; padding:4mm 6mm; }
  .serving-note .serving-title { color:#31523c; }
  .page-footer { position:absolute; bottom: 9mm; left:20mm; right:20mm; font-size:8pt; color:#a49c90; border-top:1px solid #eee8de; padding-top:3mm; }

  .storage li { font-size:10pt; line-height:1.8; margin-bottom:3mm; }
  .contact { margin-top:12mm; background:#31523c; color:#fff; padding:8mm; border-radius:4mm; }
  .contact h3 { color:#fff; font-size:13pt; margin-bottom:3mm; }
  .contact p { margin:0; font-size:9.5pt; line-height:1.8; color:#dce8da; }
</style>
</head>
<body>
  <section class="page cover">
    <div class="cover-img"></div>
    <div class="cover-inner">
      <div>
        <div class="brand">TarhanaTerapi</div>
        <div style="margin-top:6mm"><span class="badge">ÜCRETSİZ E-KİTAP</span></div>
        <h1>Kadim Çorba<br>Ritüelleri ve<br>Şifalı Tarifler</h1>
        <p class="sub">Aile tarifi, güneşte kurutulmuş tarhana ve sekiz mevsimlik tarhana tarifi.</p>
      </div>
      <div class="cover-bottom">
        Bursa Orhangazi · Üç nesillik aile tarifi<br>
        tarhanaterapi.com
      </div>
    </div>
  </section>

  <section class="page content">
    <div class="kicker">Giriş</div>
    <h2>Bir Kaşıkta Saklı Şifa</h2>
    <p class="intro">
      Tarhana, Anadolu'nun geleneksel çorbalarından biridir. Un, yoğurt, domates, biber ve az miktarda
      nohut ununun güneşle buluştuğu bu karışım; nesiller boyu aktarılan bir aile tarifidir.
      TarhanaTerapi'de bu tarifi üç nesildir sürdürüyoruz. Bu kitap; mevsimlik malzemelerle hazırlanan
      sekiz tarif, pişirme rehberi ve saklama önerilerinden oluşur.
    </p>
    <div class="quote">
      "İyi tarhana acele edilmez. Doğru malzeme, doğru kıvam ve güneşte sabırlı kurutma lezzete dönüşür."
    </div>
    <h3 class="section-title">Tarhananın Üç Adımı</h3>
    <div class="three">
      <div class="card">
        <h3>1. Yoğurma</h3>
        <p>Köy süzme yoğurdu, taş değirmen buğday unu, tarla domatesi ve közlenmiş kapya biber hamur kıvamına gelene kadar yoğrulur.</p>
      </div>
      <div class="card">
        <h3>2. İnce Açma</h3>
        <p>Hamur eşit kalınlıkta ince açılır; kuruma sırasında topaklanmaması için özen gösterilir.</p>
      </div>
      <div class="card">
        <h3>3. Güneşte Kurutma</h3>
        <p>Hamur temiz hava akımında güneşte kurutulur; elenip pamuk torbaya konur.</p>
      </div>
    </div>
    <div class="page-footer">TarhanaTerapi · Kadim Çorba Ritüelleri ve Şifalı Tarifler</div>
  </section>

  ${RECIPES_EBOOK.map(recipePage).join('')}

  <section class="page content">
    <div class="kicker">Kiler Rehberi</div>
    <h2>Tazeliği ve Şifayı Koruma</h2>
    <p class="intro">Tarhananız doğru saklandığında lezzetini ve dokusunu aylarca korur.</p>
    <ul class="storage" style="margin-top:8mm; padding-left:6mm;">
      <li>Pamuk torbasında veya kapalı cam saklama kabında, doğrudan ışıktan uzak ve 18–22 °C oda sıcaklığında saklayın.</li>
      <li>Saklama kabının içine 1 adet kurutulmuş defne yaprağı koymak nem ve güvelenmeyi engeller.</li>
      <li>Asla ıslak veya metal kaşıkla kaba girmeyin; kuru tahta kaşık kullanın.</li>
      <li>Açıldıktan sonra, özellikle yaz aylarında kapalı kapta buzdolabında saklayabilirsiniz.</li>
      <li>Son kullanma tarihi ambalaj üzerindedir; açıldıktan sonra 1 yıl içinde tüketmeniz önerilir.</li>
    </ul>
    <div class="contact">
      <h3>TarhanaTerapi'ye Ulaşın</h3>
      <p>
        E-posta: satis@tarhanaterapi.com<br>
        Adres: Muradiye Mh., Orhangazi / Bursa<br>
        Web: tarhanaterapi.com
      </p>
    </div>
    <p style="margin-top:10mm; font-size:8pt; color:#8a8378; line-height:1.6;">
      Bu e-kitap bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez. Alerji, kronik hastalık veya
      bebek beslenmesiyle ilgili özel durumlarda hekiminize danışın.<br><br>
      © 2026 TarhanaTerapi. Tüm hakları saklıdır.
    </p>
    <div class="page-footer">TarhanaTerapi · Kadim Çorba Ritüelleri ve Şifalı Tarifler</div>
  </section>
</body>
</html>`;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tarhana-ebook-'));
const htmlPath = path.join(tempDir, 'ebook.html');
fs.writeFileSync(htmlPath, html, 'utf8');

const chrome = process.env.CHROME_BIN || 'google-chrome';
const result = spawnSync(
  chrome,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPdf}`,
    `file://${htmlPath}`,
  ],
  { stdio: 'inherit' }
);

if (result.status !== 0) {
  console.error(`Chrome PDF üretimi başarısız (${chrome}). CHROME_BIN ile yol verebilirsiniz.`);
  process.exit(result.status || 1);
}

const size = fs.statSync(outputPdf).size;
console.log(`E-kitap üretildi: ${outputPdf}`);
console.log(`${RECIPES_EBOOK.length} tarif · ${(size / 1024 / 1024).toFixed(1)} MB`);
