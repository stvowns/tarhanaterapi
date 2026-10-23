/**
 * Supabase oturum doğrulama.
 *
 * Yalnızca sunucudaki `/auth/v1/user` yanıtına güvenilir; istemciden gelen
 * e-posta veya kullanıcı kimliği doğrudan kabul edilmez.
 */

/**
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<{ id: string, email: string, user: any } | null>}
 */
export async function getAuthenticatedUser(request, env) {
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
  if (!user?.id) return null;
  // Otomatik onay açık olsa da doğrulanmamış oturumlara sipariş sahipliği verme.
  if (!user.email_confirmed_at && !user.confirmed_at) return null;

  return {
    id: String(user.id),
    email: String(user.email || '').toLowerCase(),
    user,
  };
}
