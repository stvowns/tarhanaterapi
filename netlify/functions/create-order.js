const RATE_LIMIT = new Map();
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

  
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const max = 5;
  const recent = (RATE_LIMIT.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return true;
  recent.push(now);
  RATE_LIMIT.set(ip, recent);
  return false;
}

const PRODUCT_PRICES = {
  'tarhana-classic': 450,
  'tarhana-spicy': 500,
  'tarhana-baby': 500,
  'tarhana-starter-set': 850,
  'tarhana-family-pack': 450,
  'tarhana-gourmet-duo': 900,
};
const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING_FEE = 45;

const required = ['customerName', 'customerEmail', 'customerPhone', 'customerCity', 'customerDistrict', 'customerAddress'];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '' || (Array.isArray(payload[key]) && payload[key].length === 0)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'missing required field' }) };
    }
  }

  const ip = (event.headers?.['x-forwarded-for'] || event.headers?.['client-ip'] || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  const kvkkConsent =
    payload.kvkkConsent === true ||
    payload.kvkkConsent === 'true' ||
    payload.kvkkConsent === 'on' ||
    payload.kvkkConsent === 1;
  if (!kvkkConsent) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Siparişi tamamlamak için KVKK onay kutusunu işaretlemeniz gerekiyor.',
        code: 'KVKK_CONSENT_REQUIRED',
      }),
    };
  }

  const normalizedItems = Array.isArray(payload.items) ? payload.items : [];
  let subtotal = 0;
  for (const item of normalizedItems) {
    const price = PRODUCT_PRICES[item.productId];
    const qty = Number(item.quantity);
    if (!price || !Number.isInteger(qty) || qty < 1) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid product or quantity' }) };
    }
    subtotal += price * qty;
  }
  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD || normalizedItems.length === 0
      ? 0
      : STANDARD_SHIPPING_FEE;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

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
    delivery_note: payload.deliveryNote || payload.delivery_note || null,
    items: normalizedItems.map((it) => ({ productId: it.productId, name: it.name, price: PRODUCT_PRICES[it.productId], quantity: it.quantity, weight: it.weight || '', image: it.image || '' })),
    subtotal,
    shipping_fee: shippingFee,
    discount,
    total,
    status: 'Yeni Sipariş',
  };

  try {
    const created = await insertOrder(order);
    const summary = `Yeni sipariş ${orderNumber}\n${payload.customerName} - ${payload.customerCity}\nToplam: ${total} TL`;

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
    console.error('create-order error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Sipariş alınamadı' }) };
  }
};
