const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

async function insertOrder(order) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data[0];
}

async function notifyTelegram(summary) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_ADMIN_CHAT_ID, text: summary }),
  });
}

async function notifyEmail(to, subject, html) {
  if (!RESEND_API_KEY || !to) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'TarhanaTerapi <siparis@tarhanaterapi.com>',
      to: [to],
      subject,
      html,
    }),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const required = ['customerName', 'customerEmail', 'customerPhone', 'customerCity', 'customerDistrict', 'customerAddress', 'items', 'total'];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null) {
      return { statusCode: 400, body: JSON.stringify({ error: `${key} is required` }) };
    }
  }

  const orderNumber = `TT-${Date.now().toString().slice(-6)}`;
  const order = {
    order_number: orderNumber,
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    customer_phone: payload.customerPhone,
    customer_address: payload.customerAddress,
    customer_city: payload.customerCity,
    customer_district: payload.customerDistrict,
    payment_method: payload.paymentMethod || 'cod',
    subtotal: payload.subtotal || 0,
    shipping_fee: payload.shippingFee || 0,
    discount: payload.discount || 0,
    total: payload.total,
    status: 'Yeni Sipariş',
  };

  try {
    const created = await insertOrder(order);

    // Optional item insert can be added here with the created order id.
    // await insertOrderItems(created.id, payload.items);

    const summary = `Yeni sipariş ${orderNumber}\n${payload.customerName} - ${payload.customerCity}\nToplam: ${payload.total} TL`;
    await Promise.allSettled([
      notifyTelegram(summary),
      notifyEmail(payload.customerEmail, `Siparişiniz alındı: ${orderNumber}`, `<p>Sipariş numaranız: ${orderNumber}</p>`),
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, id: created.id }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};