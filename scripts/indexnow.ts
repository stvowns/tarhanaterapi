/**
 * IndexNow: Bing, Yandex, Seznam ve Naver'a yeni/değişen URL'leri bildirir.
 * Kullanım: npm run build && npm run indexnow
 * Anahtar dosyası public/<key>.txt olarak yayınlanır.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = '11b92a56bf582414420a4ab1735edb24';
const SITE = 'tarhanaterapi.netlify.app';
const HOST = `https://${SITE}`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sitemap = readFileSync(join(root, 'dist', 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (urls.length === 0) {
  throw new Error('sitemap.xml içinde URL bulunamadı. Önce npm run build çalıştırın.');
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: SITE,
    key: KEY,
    keyLocation: `${HOST}/${KEY}.txt`,
    urlList: urls,
  }),
});

console.log(`IndexNow: ${urls.length} URL gönderildi, HTTP ${response.status}`);
if (!response.ok) {
  console.error(await response.text());
  process.exitCode = 1;
}
