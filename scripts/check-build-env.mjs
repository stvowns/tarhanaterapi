#!/usr/bin/env node
/**
 * Deploy öncesi zorunlu frontend build değişkenlerini kontrol eder.
 *
 * Amaç: `npm run cf:deploy` yanlışlıkla env'siz build alıp canlıya
 * `VITE_SUPABASE_URL ... tanımlı olmalı` hatası göndermesin.
 *
 * Değerleri yazdırmaz; yalnızca eksik değişken adlarını söyler.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const env = { ...process.env };

for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  for (const rawLine of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (env[key]) continue;
    env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const recommended = ['VITE_SITE_URL', 'VITE_GOOGLE_CLIENT_ID'];
const missing = required.filter((key) => !env[key]);
const absentRecommended = recommended.filter((key) => !env[key]);

if (missing.length) {
  console.error('\nDeploy durduruldu. Eksik frontend build değişkenleri:');
  for (const key of missing) console.error(`  - ${key}`);
  console.error('\n.gitignore kapsamındaki .env.local dosyasına ekleyin veya Cloudflare build env kullanın.\n');
  process.exit(1);
}

if (absentRecommended.length) {
  console.warn('\nUyarı: şu isteğe bağlı değişkenler tanımlı değil:');
  for (const key of absentRecommended) console.warn(`  - ${key}`);
  console.warn('Site çalışır; ancak Google ile giriş veya canonical adres varsayılana düşebilir.\n');
}

console.log('Frontend build ortamı hazır.');
