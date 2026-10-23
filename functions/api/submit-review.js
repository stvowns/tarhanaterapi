/**
 * Cloudflare Pages Function — POST /api/submit-review
 * Yorumları "onay bekliyor" olarak Supabase'e kaydeder ve Telegram'a bildirir.
 */

import { consumeRateLimit } from '../_lib/rate-limit.js';

const RATE_LIMIT = new Map();

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const max = 3;
  const recent = (RATE_LIMIT.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return true;
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return false;
}

const esc = (value) =>
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

async function notifyTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_ADMIN_CHAT_ID, text }),
  });
}

export async function onRequestPost({ request, env }) {
  const ip = (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  )
    .split(',')[0]
    .trim();

  const durableLimit = await consumeRateLimit(env, `submit-review:${ip}`, 3, 600);
  if (durableLimit === false || (durableLimit === null && rateLimited(ip))) {
    return json({ error: 'Çok fazla yorum gönderildi. Lütfen biraz sonra tekrar deneyin.' }, 429);
  }

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const author = String(payload.author || '').trim().slice(0, 80);
  const content = String(payload.content || '').trim().slice(0, 2000);
  const location = String(payload.location || '').trim().slice(0, 80) || 'Türkiye';
  const productName = String(payload.productName || '').trim().slice(0, 160);
  const rating = Number(payload.rating);

  if (!author || !content) {
    return json({ error: 'Ad ve yorum alanları zorunludur.' }, 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: 'Puan 1 ile 5 arasında olmalıdır.' }, 400);
  }

  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        author,
        location,
        rating,
        content,
        product_name: productName || null,
        verified: false,
      }),
    });

    if (!res.ok) {
      console.error('submit-review error', await res.text());
      return json({ error: 'Yorum kaydedilemedi' }, 500);
    }

    await notifyTelegram(
      env,
      `Yeni yorum onay bekliyor\n${author} · ${rating}/5\n${productName || 'Ürün belirtilmedi'}\n${content.slice(0, 180)}`
    ).catch(() => {});

    return json({
      success: true,
      message: 'Yorumunuz alındı. Yönetici onayından sonra yayınlanacak.',
    });
  } catch (err) {
    console.error('submit-review error', err);
    return json({ error: 'Yorum kaydedilemedi' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
