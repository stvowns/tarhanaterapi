/**
 * Cloudflare Pages Function — GET /api/list-newsletter-contacts
 * Yönetici oturumu doğrulanır; Resend kontaktlarını bülten alıcı listesi olarak döner.
 */

const ADMIN_EMAILS = ['layeredstudio78@gmail.com'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

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
  const email = String(user?.email || '').toLowerCase();
  return ADMIN_EMAILS.includes(email) ? email : null;
}

export async function onRequestGet({ request, env }) {
  const adminEmail = await getAdminEmail(env, request.headers.get('authorization'));
  if (!adminEmail) return json({ error: 'Yetkisiz istek' }, 401);

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'RESEND_API_KEY tanımlı değil' }, 500);

  const res = await fetch('https://api.resend.com/contacts?limit=100', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('list-newsletter-contacts error', await res.text());
    return json({ error: 'Resend kontaktları alınamadı' }, 502);
  }

  const payload = await res.json();
  const contacts = (Array.isArray(payload.data) ? payload.data : [])
    .map((contact) => ({
      id: contact.id || contact.email,
      email: String(contact.email || '').toLowerCase(),
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      unsubscribed: Boolean(contact.unsubscribed),
      createdAt: contact.created_at || '',
    }))
    .filter((contact) => contact.email)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return json({
    success: true,
    count: contacts.length,
    hasMore: Boolean(payload.has_more),
    contacts,
  });
}

export async function onRequestPost() {
  return json({ error: 'Method not allowed' }, 405);
}
