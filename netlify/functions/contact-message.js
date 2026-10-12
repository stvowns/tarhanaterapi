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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const topic = String(payload.topic || '').trim();
  const message = String(payload.message || '').trim();

  if (!name || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'required fields missing' }) };
  }

  const text = `Yeni iletişim mesajı\nAd: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nKonu: ${topic}\nMesaj: ${message}`;

  await Promise.allSettled([
    notifyTelegram(text),
    notifyEmail(`İletişim Formu: ${topic}`, `<p><strong>Ad:</strong> ${name}</p><p><strong>E-posta:</strong> ${email}</p><p><strong>Telefon:</strong> ${phone}</p><p><strong>Konu:</strong> ${topic}</p><p><strong>Mesaj:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`),
  ]);

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
};