import { getAdmin } from '../_lib/admin.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestGet({ request, env }) {
  const admin = await getAdmin(request, env);
  if (!admin) {
    return json({ error: 'Yetkisiz istek' }, 401);
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    console.error('list-orders supabase error', await res.text());
    return json({ error: 'Siparişler alınamadı' }, 500);
  }
  const rows = await res.json();

  const orders = rows.map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    customerAddress: r.customer_address || '',
    customerCity: r.customer_city,
    customerDistrict: r.customer_district,
    paymentMethod: r.payment_method || 'bank_transfer',
    deliveryNote: r.delivery_note || '',
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal || 0),
    shippingFee: Number(r.shipping_fee || 0),
    discount: Number(r.discount || 0),
    total: Number(r.total || 0),
    status: r.status || 'Yeni Sipariş',
    createdAt: r.created_at,
  }));

  return json({ orders });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
