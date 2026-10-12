const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

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