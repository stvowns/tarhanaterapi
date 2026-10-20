/**
 * Cloudflare Pages Function — POST /api/subscribe
 * Bülten / e-kitap e-postalarını Supabase'e kaydeder ve Resend contacts + segmente ekler.
 */

const RATE_LIMIT = new Map();

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 10;
  const recent = (RATE_LIMIT.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return true;
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return false;
}

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export async function onRequestPost({ request, env }) {
  const ip = (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  )
    .split(',')[0]
    .trim();

  if (rateLimited(ip)) {
    return json({ error: 'Too many requests' }, 429, { 'Retry-After': '60' });
  }

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const email = String(payload.email || '').trim().toLowerCase().slice(0, 254);
  const source = payload.source === 'newsletter' ? 'newsletter' : 'ebook';

  if (!isValidEmail(email)) {
    return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400);
  }

  try {
    const existing = await fetch(
      `${env.SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const rows = existing.ok ? await existing.json() : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      const inserted = await fetch(`${env.SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email, source }),
      });

      if (!inserted.ok) {
        const detail = await inserted.text();
        // Aynı e-posta başka bir istekte eklenmiş olabilir; kullanıcıya hata gösterme.
        if (!detail.includes('duplicate key')) {
          console.error('subscribe insert error', detail);
        }
      }
    }

    const segmentId = env.RESEND_AUDIENCE_ID || 'decff556-906f-4dd1-93c1-3009796ab097';
    if (env.RESEND_API_KEY && segmentId) {
      const contact = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      });

      if (!contact.ok) {
        const detail = await contact.text();
        // Kişi zaten Resend'de olabilir; segment ekleme adımına devam ediyoruz.
        if (contact.status !== 409 && !detail.toLowerCase().includes('already')) {
          console.error('resend contact error', contact.status, detail);
        }
      }

      const segment = await fetch(
        `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
          },
        }
      );

      if (!segment.ok) {
        const detail = await segment.text();
        console.error('resend segment error', segment.status, detail);
      }
    }

    return json({ success: true });
  } catch (err) {
    console.error('subscribe error', err);
    return json({ error: 'Kayıt alınamadı' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
