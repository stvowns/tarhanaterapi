/**
 * Cloudflare Pages Function — GET /api/list-subscribers
 * Yönetici oturumu doğrulanır; bülten/e-kitap e-postalarını Supabase'den döndürür.
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

export async function onRequestGet({ request, env }) {
  const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
  if (!adminEmail) return json({ error: 'Yetkisiz istek' }, 401);

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/subscribers?select=id,email,source,created_at&order=created_at.desc&limit=5000`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    console.error('list-subscribers error', await res.text());
    return json({ error: 'Liste alınamadı' }, 500);
  }

  const rows = await res.json();
  return json({
    success: true,
    count: rows.length,
    subscribers: rows.map((row) => ({
      id: row.id,
      email: row.email,
      source: row.source,
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleDateString('tr-TR')
        : '',
    })),
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
