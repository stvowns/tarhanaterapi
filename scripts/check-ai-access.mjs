#!/usr/bin/env node
/**
 * AI bot erişim kontrolü.
 * Kullanım: node scripts/check-ai-access.mjs [https://tarhanaterapi.com]
 *
 * Her AI botunun User-Agent'ı ile kritik sayfaları ister; 200 dönmeli,
 * challenge/403 sayfası görmemeli ve gerçek HTML içeriği almalıdır.
 */

const BASE = (process.argv[2] || 'https://tarhanaterapi.com').replace(/\/+$/, '');

const BOTS = [
  { name: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', expect: 'html' },
  { name: 'Bingbot', ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', expect: 'html' },
  { name: 'OAI-SearchBot', ua: 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)', expect: 'html' },
  { name: 'ChatGPT-User', ua: 'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)', expect: 'html' },
  { name: 'PerplexityBot', ua: 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)', expect: 'html' },
  { name: 'Perplexity-User', ua: 'Mozilla/5.0 (compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)', expect: 'html' },
  { name: 'Claude-SearchBot', ua: 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://www.anthropic.com/claude-searchbot)', expect: 'html' },
  { name: 'Claude-User', ua: 'Mozilla/5.0 (compatible; Claude-User/1.0; +https://www.anthropic.com/claude-user)', expect: 'html' },
  { name: 'GPTBot', ua: 'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)', expect: 'html' },
  { name: 'CCBot', ua: 'CCBot/2.0 (https://commoncrawl.org/faq/)', expect: 'html' },
  { name: 'Applebot', ua: 'Mozilla/5.0 (compatible; Applebot/0.1; +http://www.apple.com/go/applebot)', expect: 'html' },
];

const PATHS = [
  { path: '/', marker: 'TarhanaTerapi' },
  { path: '/urunler', marker: 'Tarhana' },
  { path: '/rehber/tarhana-neden-eksir', marker: 'Tarhana' },
  { path: '/robots.txt', marker: 'OAI-SearchBot' },
  { path: '/sitemap.xml', marker: '<urlset' },
  { path: '/llms.txt', marker: 'TarhanaTerapi' },
];

const CHALLENGE = [/just a moment/i, /attention required/i, /cf-chl/i, /cf_chl_opt/i, /enable javascript and cookies/i];

async function check(bot, target) {
  const url = `${BASE}${target.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': bot.ua, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      redirect: 'follow',
      signal: controller.signal,
    });
    const body = await res.text();
    const challenge = CHALLENGE.some((re) => re.test(body));
    const hasMarker = body.includes(target.marker);
    const ok = res.status === 200 && !challenge && hasMarker;
    return { ok, status: res.status, challenge, hasMarker, bytes: body.length, type: res.headers.get('content-type') || '' };
  } catch (err) {
    return { ok: false, status: 'ERR', challenge: false, hasMarker: false, bytes: 0, type: '', error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

const failures = [];
console.log(`AI bot erişim testi: ${BASE}\n`);

for (const bot of BOTS) {
  const results = await Promise.all(PATHS.map((p) => check(bot, p)));
  const bad = results.map((r, i) => ({ ...r, path: PATHS[i].path })).filter((r) => !r.ok);
  const status = bad.length === 0 ? '✅' : '❌';
  console.log(`${status} ${bot.name.padEnd(17)} ${results.map((r) => r.status).join(' / ')}`);
  for (const f of bad) {
    failures.push({ bot: bot.name, ...f });
    console.log(`     ↳ ${f.path} → ${f.status}${f.challenge ? ' [CHALLENGE]' : ''}${!f.hasMarker ? ' [İÇERİK YOK]' : ''}${f.error ? ` (${f.error})` : ''}`);
  }
}

async function checkAgentReadiness() {
  const results = [];
  const add = (name, ok, detail) => {
    results.push({ name, ok, detail });
    if (!ok) failures.push({ bot: 'AgentReadiness', path: name, status: 'FAIL', detail });
  };

  try {
    const res = await fetch(`${BASE}/robots.txt`, { headers: { 'Cache-Control': 'no-cache' } });
    const body = await res.text();
    const signal = body.match(/^Content-Signal:\s*.+$/im)?.[0] || 'yok';
    const ok =
      res.ok &&
      /search=yes/i.test(signal) &&
      /ai-input=yes/i.test(signal) &&
      /ai-train=yes/i.test(signal);
    add('robots.txt Content-Signal', ok, `${res.status} · ${signal}`);
  } catch (err) {
    add('robots.txt Content-Signal', false, err.message);
  }

  try {
    const res = await fetch(`${BASE}/`, {
      headers: {
        Accept: 'text/markdown, text/html;q=0.9, */*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    const body = await res.text();
    const type = res.headers.get('content-type') || '';
    const vary = res.headers.get('vary') || '';
    const ok =
      res.status === 200 &&
      /text\/markdown/i.test(type) &&
      !/^\s*<!doctype html/i.test(body) &&
      /accept/i.test(vary);
    add('Markdown negotiation', ok, `${res.status} · ${type} · Vary: ${vary || 'yok'}`);
  } catch (err) {
    add('Markdown negotiation', false, err.message);
  }

  try {
    const res = await fetch(`${BASE}/urunler/tarhana-classic.md`, {
      headers: { 'Cache-Control': 'no-cache' },
      redirect: 'follow',
    });
    const body = await res.text();
    const type = res.headers.get('content-type') || '';
    const ok = res.status === 200 && /text\/markdown/i.test(type) && body.includes('Geleneksel');
    add('Markdown .md kardeşi', ok, `${res.status} · ${type}`);
  } catch (err) {
    add('Markdown .md kardeşi', false, err.message);
  }

  try {
    const res = await fetch(`${BASE}/`, {
      headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' },
      redirect: 'follow',
    });
    const link = res.headers.get('link') || '';
    const ok = /rel="(?:describedby|alternate|api-catalog|service-doc|service-desc)"/i.test(link);
    add('Link header', ok, `${res.status} · ${link || 'yok'}`);
  } catch (err) {
    add('Link header', false, err.message);
  }

  for (const path of ['/auth.md', '/.well-known/security.txt']) {
    try {
      const res = await fetch(`${BASE}${path}`, { headers: { 'Cache-Control': 'no-cache' } });
      add(path, res.status === 200, `${res.status} · ${res.headers.get('content-type') || 'yok'}`);
    } catch (err) {
      add(path, false, err.message);
    }
  }

  console.log('\nAgent Readiness sinyalleri:');
  for (const result of results) {
    console.log(`${result.ok ? '✅' : '❌'} ${result.name.padEnd(28)} ${result.detail}`);
  }
}

await checkAgentReadiness();

console.log('');
if (failures.length) {
  console.log(`❌ ${failures.length} sorun bulundu.`);
  process.exitCode = 1;
} else {
  console.log('✅ Tüm botlar ve agent sinyalleri erişilebilir.');
}
