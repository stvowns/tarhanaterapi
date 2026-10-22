/**
 * Cloudflare Pages Function — POST /api/contact-message
 * Kaynak: netlify/functions/contact-message.js (davranış birebir korunmuştur).
 */

const rateLimit = new Map();

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const escapeHtml = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const sanitize = escapeHtml;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > 60000) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count++;
  rateLimit.set(ip, entry);
  return entry.count <= 5;
};

const notifyTelegram = async (env, text) => {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_ADMIN_CHAT_ID, text }),
  });
};

const notifyEmail = async (env, subject, html) => {
  if (!env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: 'TarhanaTerapi <satis@tarhanaterapi.com>',
      to: ['satis@tarhanaterapi.com'],
      subject,
      html,
    }),
  });
};

export async function onRequestPost({ request, env }) {
  const ip = (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  )
    .split(',')[0]
    .trim();

  if (!checkRateLimit(ip)) {
    return json({ error: 'Too many requests' }, 429, { 'Retry-After': '60' });
  }

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const rawName = String(payload.name || '');
  const rawEmail = String(payload.email || '');
  const rawPhone = String(payload.phone || '');
  const rawTopic = String(payload.topic || '');
  const rawMessage = String(payload.message || '');

  if (!rawName || !rawMessage) {
    return json({ error: 'required fields missing' }, 400);
  }

  const name = rawName.trim().slice(0, 100);
  const email = rawEmail.trim().slice(0, 254);
  const phone = rawPhone.trim().slice(0, 32);
  const topic = (rawTopic.trim() || 'Genel').slice(0, 64);
  const message = rawMessage.trim().slice(0, 5000);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  const sName = sanitize(name);
  const sEmail = sanitize(email);
  const sPhone = sanitize(phone);
  const sTopic = sanitize(topic);
  const sMessage = sanitize(message).replace(/\n/g, '<br/>');
  const safeTopic = topic.replace(/[\r\n]+/g, ' ');

  const text = `Yeni iletişim mesajı\nAd: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nKonu: ${safeTopic}\nMesaj: ${message}`;

  await Promise.allSettled([
    notifyTelegram(env, text),
    notifyEmail(
      env,
      `İletişim Formu: ${safeTopic}`,
      `<p><strong>Ad:</strong> ${sName}</p><p><strong>E-posta:</strong> ${sEmail}</p><p><strong>Telefon:</strong> ${sPhone}</p><p><strong>Konu:</strong> ${sTopic}</p><p><strong>Mesaj:</strong><br/>${sMessage}</p>`
    ),
  ]);

  return json({ success: true });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
