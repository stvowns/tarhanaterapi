const SUPABASE_URL = process.env.SUPABASE_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const notifyTelegram = async (text) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text }),
  });
};

const notifyEmail = async (subject, html) => {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'TarhanaTerapi <iletisim@tarhanaterapi.com>', to: ['sifa@tarhanaterapi.com'], subject, html }),
  });
};

const rateLimit = {};

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
  const entry = rateLimit[ip] || { count: 0, ts: now };
  if (now - entry.ts > 60000) { entry.count = 0; entry.ts = now; }
  entry.count++;
  rateLimit[ip] = entry;
  return entry.count <= 5;
};

exports.handler = async (event) => {
  const ip = String(event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for'] || 'unknown').split(',')[0].trim();

  if (!checkRateLimit(ip)) {
    return { statusCode: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const rawName = String(payload.name || '');
  const rawEmail = String(payload.email || '');
  const rawPhone = String(payload.phone || '');
  const rawTopic = String(payload.topic || '');
  const rawMessage = String(payload.message || '');

  if (!rawName || !rawMessage) {
    return { statusCode: 400, body: JSON.stringify({ error: 'required fields missing' }) };
  }

  const name = rawName.trim().slice(0, 100);
  const email = rawEmail.trim().slice(0, 254);
  const phone = rawPhone.trim().slice(0, 32);
  const topic = (rawTopic.trim() || 'Genel').slice(0, 64);
  const message = rawMessage.trim().slice(0, 5000);

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_email' }) };
  }

  const sName = sanitize(name);
  const sEmail = sanitize(email);
  const sPhone = sanitize(phone);
  const sTopic = sanitize(topic);
  const sMessage = sanitize(message).replace(/\n/g, '<br/>');

  const text = `Yeni iletişim mesajı\nAd: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nKonu: ${topic}\nMesaj: ${message}`;

  await Promise.allSettled([
    notifyTelegram(text),
    notifyEmail(`İletişim Formu: ${topic}`, `<p><strong>Ad:</strong> ${sName}</p><p><strong>E-posta:</strong> ${sEmail}</p><p><strong>Telefon:</strong> ${sPhone}</p><p><strong>Konu:</strong> ${sTopic}</p><p><strong>Mesaj:</strong><br/>${sMessage}</p>`),
  ]);

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
};
