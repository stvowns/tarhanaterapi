/**
 * Ortak yönetici yetkilendirmesi.
 *
 * Birincil kaynak: Supabase `app_metadata.role === 'admin'`.
 * Geçiş dönemi: rol atanana kadar eski e-posta allowlist'i çalışmaya devam eder.
 *
 * Not: E-posta allowlist'i yalnızca geçiş içindir. Supabase panelinden
 * Authentication > Users > kullanıcı > Raw App Meta Data alanına
 * `{"role":"admin"}` eklendikten sonra bu fallback kaldırılabilir.
 */

const LEGACY_ADMIN_EMAILS = ['layeredstudio78@gmail.com'];

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

/**
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<{ email: string, user: any, role: 'admin' | 'legacy-allowlist' } | null>}
 */
export async function getAdmin(request, env) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  if (!env.SUPABASE_URL || !anonKey) return null;

  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
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
  const role = String(user?.app_metadata?.role || '').toLowerCase();

  if (role === 'admin') {
    return { email, user, role: 'admin' };
  }

  if (LEGACY_ADMIN_EMAILS.includes(email)) {
    return { email, user, role: 'legacy-allowlist' };
  }

  return null;
}
