const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const ADMIN_EMAILS = ['layeredstudio78@gmail.com'];

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
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

  const adminEmail = await getAdminEmail(event.headers?.authorization || event.headers?.Authorization);
  if (!adminEmail) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Yetkisiz istek' }) };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) { console.error('list-orders supabase error', await res.text()); return { statusCode: 500, body: JSON.stringify({ error: 'Siparişler alınamadı' }) }; }
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
    paymentMethod: r.payment_method || 'cod',
    deliveryNote: r.delivery_note || '',
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal || 0),
    shippingFee: Number(r.shipping_fee || 0),
    discount: Number(r.discount || 0),
    total: Number(r.total || 0),
    status: r.status || 'Yeni Sipariş',
    createdAt: r.created_at,
  }));

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orders }) };
};