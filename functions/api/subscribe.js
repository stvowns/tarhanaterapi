/**
 * Cloudflare Pages Function — POST /api/subscribe
 * Bülten / e-kitap e-postalarını Supabase'e kaydeder.
 *
 * KVKK: E-posta adresi ve pazarlama izni, açık rıza olmadan kaydedilmez.
 * `consent` her formda zorunludur; `marketingConsent` bülten için zorunlu,
 * e-kitap için isteğe bağlıdır. Resend'e yalnızca pazarlama onayı varsa eklenir.
 */

const RATE_LIMIT = new Map();
const CONSENT_VERSION = '2026-10-23-v1';

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
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

const supabaseHeaders = (env, extra = {}) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  ...extra,
});

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
  const consent = payload.consent === true;
  const marketingConsent = payload.marketingConsent === true;

  if (!isValidEmail(email)) {
    return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400);
  }

  if (!consent) {
    return json({ error: 'KVKK onayı olmadan e-posta adresi kaydedilemez.' }, 400);
  }

  if (source === 'newsletter' && !marketingConsent) {
    return json({ error: 'Bülten için açık rıza gerekli.' }, 400);
  }

  const consentAt = new Date().toISOString();
  const consentFields = {
    consent_at: consentAt,
    consent_version: CONSENT_VERSION,
    consent_source: source,
  };

  try {
    const existing = await fetch(
      `${env.SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(
        email
      )}&select=id,marketing_consent`,
      { headers: supabaseHeaders(env) }
    );

    if (!existing.ok) {
      console.error('subscribe read error', existing.status, await existing.text());
      return json({ error: 'Kayıt alınamadı' }, 500);
    }

    const rows = await existing.json();
    let shouldUpdate = Array.isArray(rows) && rows.length > 0;

    if (!shouldUpdate) {
      const inserted = await fetch(`${env.SUPABASE_URL}/rest/v1/subscribers`, {
        method: 'POST',
        headers: supabaseHeaders(env, {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        }),
        body: JSON.stringify({
          email,
          source,
          marketing_consent: marketingConsent,
          ...consentFields,
        }),
      });

      if (!inserted.ok) {
        const detail = await inserted.text();
        // Aynı e-posta başka bir istekte eklenmiş olabilir; tekrar okuyup güncelle.
        if (!detail.includes('duplicate key')) {
          console.error('subscribe insert error', detail);
          return json({ error: 'Kayıt alınamadı' }, 500);
        }
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      const update = { ...consentFields };
      if (marketingConsent) {
        update.marketing_consent = true;
        update.unsubscribed_at = null;
        if (source === 'newsletter') update.source = 'newsletter';
      }

      const patched = await fetch(
        `${env.SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: supabaseHeaders(env, {
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          }),
          body: JSON.stringify(update),
        }
      );

      if (!patched.ok) {
        console.error('subscribe update error', patched.status, await patched.text());
        return json({ error: 'Kayıt güncellenemedi' }, 500);
      }
    }

    // E-kitap indirmesi için e-posta vermek bülten onayı değildir.
    // Pazarlama onayı yoksa Resend audience/segmentine dokunma.
    if (marketingConsent) {
      const segmentId =
        env.RESEND_AUDIENCE_ID || 'decff556-906f-4dd1-93c1-3009796ab097';

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
          // Kişi zaten Resend'de olabilir; segment ekleme adımına devam et.
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
    }

    return json({ success: true, marketingConsent });
  } catch (err) {
    console.error('subscribe error', err);
    return json({ error: 'Kayıt alınamadı' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
