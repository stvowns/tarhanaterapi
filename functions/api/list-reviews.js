/**
 * Cloudflare Pages Function — GET /api/list-reviews?status=approved|pending
 * Onaylı yorumlar herkese, onay bekleyenler yalnızca yöneticiye döner.
 */

const ADMIN_EMAILS = ['layeredstudio78@gmail.com'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function tokenAal(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded))?.aal || null;
  } catch {
    return null;
  }
}

async function getAdminEmail(env, authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user?.email_confirmed_at && !user?.confirmed_at) return null;
  // ADMIN_MFA_REQUIRED=true iken yalnızca aal2 oturumları yönetici API'lerini kullanabilir.
  if (env.ADMIN_MFA_REQUIRED === 'true' && tokenAal(token) !== 'aal2') return null;

  const email = String(user?.email || '').toLowerCase();
  return ADMIN_EMAILS.includes(email) ? email : null;
}

const mapReview = (row) => ({
  id: row.id,
  author: row.author,
  location: row.location || 'Türkiye',
  rating: row.rating,
  content: row.content,
  productName: row.product_name || '',
  verified: Boolean(row.verified),
  createdAt: row.created_at || '',
});

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') === 'pending' ? 'pending' : 'approved';

  if (status === 'pending') {
    const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
    if (!adminEmail) return json({ error: 'Yetkisiz istek' }, 401);
  }

  const filter = status === 'pending' ? 'verified=eq.false' : 'verified=eq.true';
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/reviews?${filter}&select=id,author,location,rating,content,product_name,verified,created_at&order=created_at.desc&limit=200`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('list-reviews error', await res.text());
    return json({ error: 'Yorumlar alınamadı' }, 500);
  }

  const rows = await res.json();
  return json({
    success: true,
    status,
    count: rows.length,
    reviews: rows.map(mapReview),
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
