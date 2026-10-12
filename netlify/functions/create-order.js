const { Pool } = require('pg');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const dns = require('dns');

let pool = null;
async function getPool() {
  if (pool) return pool;
  const { address } = await dns.promises.lookup('db.atrvalwnvruzsbpkgfrl.supabase.co', { family: 4 });
  pool = new Pool({
    host: address,
    port: 5432,
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  return pool;
}

async function insertOrder(order) {
  const p = await getPool();
  const client = await p.connect();
  try {
    const sql = `insert into orders
      (order_number, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_district, payment_method, subtotal, shipping_fee, discount, total, status)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      returning id`;
    const result = await client.query(sql, [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.customer_address,
      order.customer_city,
      order.customer_district,
      order.payment_method,
      order.subtotal,
      order.shipping_fee,
      order.discount,
      order.total,
      order.status,
    ]);
    return result.rows[0];
  } finally {
    client.release();
  }
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

  const required = ['customerName', 'customerEmail', 'customerPhone', 'customerCity', 'customerDistrict', 'customerAddress', 'total'];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
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
    subtotal: payload.subtotal || payload.total || 0,
    shipping_fee: payload.shippingFee || 0,
    discount: payload.discount || 0,
    total: payload.total,
    status: 'Yeni Sipariş',
  };

  try {
    const created = await insertOrder(order);
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
