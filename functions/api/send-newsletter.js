/**
 * Cloudflare Pages Function — POST /api/send-newsletter
 * Yönetici oturumu doğrulanır; seçilen Resend kontaktlarına bülten e-postası gönderir.
 */

const ADMIN_EMAILS = ['layeredstudio78@gmail.com'];
const MAX_RECIPIENTS = 25;
const SITE_URL = 'https://tarhanaterapi.com';
const UNSUBSCRIBE_MAILTO =
  'mailto:satis@tarhanaterapi.com?subject=Abonelikten%20%C3%A7%C4%B1k%C4%B1%C5%9F';
const encoder = new TextEncoder();

const base64UrlEncode = (bytes) => {
  let binary = '';
  const array = new Uint8Array(bytes);
  for (let index = 0; index < array.length; index += 1) {
    binary += String.fromCharCode(array[index]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function buildUnsubscribeUrl(email, env) {
  const secret = env.UNSUBSCRIBE_SECRET || env.RESEND_API_KEY || '';
  if (!secret) return UNSUBSCRIBE_MAILTO;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(email));
  const token = `${base64UrlEncode(encoder.encode(email))}.${base64UrlEncode(signature)}`;
  return `${SITE_URL}/api/unsubscribe?token=${token}`;
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAdminEmail(env, authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user?.email_confirmed_at && !user?.confirmed_at) return null;
  const email = String(user?.email || '').toLowerCase();
  return ADMIN_EMAILS.includes(email) ? email : null;
}

async function sendOne({ apiKey, from, replyTo, subject, html, email, unsubscribeUrl }) {
  const personalizedHtml = unsubscribeUrl.startsWith('https://')
    ? html.split(UNSUBSCRIBE_MAILTO).join(unsubscribeUrl)
    : html;

  const body = JSON.stringify({
    from,
    to: [email],
    reply_to: replyTo,
    subject,
    html: personalizedHtml,
    headers: {
      'List-Unsubscribe': unsubscribeUrl.startsWith('https://')
        ? `<${unsubscribeUrl}>`
        : `<${UNSUBSCRIBE_MAILTO}>`,
      ...(unsubscribeUrl.startsWith('https://')
        ? { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
        : {}),
    },
  });

  const request = () =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });

  let res = await request();
  if (res.status === 429) {
    await wait(1200);
    res = await request();
  }

  if (!res.ok) {
    const detail = await res.text();
    console.error('send-newsletter resend error', res.status, detail.slice(0, 500));
    return { email, ok: false, status: res.status, error: detail.slice(0, 300) };
  }

  const payload = await res.json().catch(() => ({}));
  return { email, ok: true, status: res.status, id: payload.id || '' };
}

export async function onRequestPost({ request, env }) {
  const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
  if (!adminEmail) return json({ error: 'Yetkisiz istek' }, 401);

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'RESEND_API_KEY tanımlı değil' }, 500);

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const subject = String(payload.subject || '').replace(/[\r\n]+/g, ' ').trim();
  const html = String(payload.html || '');
  const recipients = Array.isArray(payload.recipients)
    ? Array.from(
        new Set(
          payload.recipients
            .map((email) => String(email || '').trim().toLowerCase())
            .filter(isValidEmail)
        )
      )
    : [];

  if (!subject || subject.length > 180) {
    return json({ error: 'Konu 1-180 karakter arasında olmalı' }, 400);
  }
  if (!html || html.length > 120000) {
    return json({ error: 'E-posta içeriği boş veya çok uzun' }, 400);
  }
  if (recipients.length === 0) {
    return json({ error: 'En az bir alıcı seçin' }, 400);
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return json({ error: `Tek seferde en fazla ${MAX_RECIPIENTS} alıcıya gönderilebilir` }, 400);
  }

  const from = env.NEWSLETTER_FROM_EMAIL || 'TarhanaTerapi <satis@tarhanaterapi.com>';
  const replyTo = env.NEWSLETTER_REPLY_TO || 'satis@tarhanaterapi.com';

  const results = [];
  for (let index = 0; index < recipients.length; index += 1) {
    const email = recipients[index];
    // Resend ücretsiz plan hız limitine takılmamak için küçük bir aralık bırakıyoruz.
    if (index > 0) await wait(320);
    const unsubscribeUrl = await buildUnsubscribeUrl(email, env);
    results.push(
      await sendOne({ apiKey, from, replyTo, subject, html, email, unsubscribeUrl })
    );
  }

  const sent = results.filter((result) => result.ok).length;
  const failed = results.length - sent;

  if (sent === 0) {
    return json(
      { error: 'E-posta gönderilemedi', sent, failed, results },
      502
    );
  }

  return json({ success: failed === 0, sent, failed, results });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
