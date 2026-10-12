const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAILS = ['layeredstudio78@gmail.com', 'admin@tarhanaterapi.com'];

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const notifyEmail = async (to, subject, html) => {
  if (!RESEND_API_KEY || !to) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: 'TarhanaTerapi <siparis@tarhanaterapi.com>', to: [to], subject, html }),
    });
  } catch (e) {
    console.error(e);
  }
};


async function getAdminEmail(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  const email = String(user?.email || '').toLowerCase();
  return ADMIN_EMAILS.includes(email) ? email : null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  const adminEmail = await getAdminEmail(event.headers?.authorization || event.headers?.Authorization);
  if (!adminEmail) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Yetkisiz istek' }) };
  }

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  const { orderId, status, customerEmail, orderNumber } = payload;
  if (!orderId || !status) return { statusCode: 400, body: JSON.stringify({ error: 'orderId and status required' }) };

  const allowed = ['Yeni Sipariş', 'Hazırlanıyor', 'Kargoya Verildi', 'Tamamlandı'];
  if (!allowed.includes(status)) return { statusCode: 400, body: JSON.stringify({ error: 'invalid status' }) };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) return { statusCode: 500, body: JSON.stringify({ error: await res.text() }) };
  const data = await res.json();

  if (customerEmail) {
    await notifyEmail(
      customerEmail,
      `Sipariş Durumu Güncellendi: ${orderNumber || ''}`,
      `<p>Sayın ${payload.customerName || 'Müşteri'},</p><p>Siparişinizin durumu: <strong>${status}</strong>.</p><p>Sipariş No: ${orderNumber || ''}</p>`
    );
  }

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, order: data[0] }) };
};