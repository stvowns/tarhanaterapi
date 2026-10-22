/**
 * Cloudflare Pages Function — POST /api/moderate-review
 * Yönetici oturumu doğrulanır; yorum onaylanır veya silinir.
 */

const ADMIN_EMAILS = ['layeredstudio78@gmail.com'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
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

export async function onRequestPost({ request, env }) {
  const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
  if (!adminEmail) return json({ error: 'Yetkisiz istek' }, 401);

  let payload = {};
  try {
    payload = JSON.parse((await request.text()) || '{}');
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const id = String(payload.id || '').trim();
  const action = payload.action;

  if (!id || !['approve', 'delete'].includes(action)) {
    return json({ error: 'id ve geçerli bir action gerekli' }, 400);
  }

  const endpoint = `${env.SUPABASE_URL}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`;
  const res = await fetch(endpoint, {
    method: action === 'delete' ? 'DELETE' : 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: action === 'delete' ? undefined : JSON.stringify({ verified: true }),
  });

  if (!res.ok) {
    console.error('moderate-review error', await res.text());
    return json({ error: 'İşlem yapılamadı' }, 500);
  }

  return json({ success: true, action });
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
