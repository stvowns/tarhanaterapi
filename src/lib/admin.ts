/**
 * Yönetici görünürlüğü için tek kaynak.
 *
 * Supabase `app_metadata.role === 'admin'` birincil kontrol.
 * Geçiş döneminde eski e-posta allowlist'i de çalışır; sunucu tarafındaki
 * gerçek yetki kontrolü `functions/_lib/admin.js` içindedir.
 */
export const LEGACY_ADMIN_EMAIL = 'layeredstudio78@gmail.com';

type AdminCandidate = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export function isAdminUser(user: AdminCandidate | null | undefined): boolean {
  if (!user) return false;
  const role = String(user.app_metadata?.role || '').toLowerCase();
  return role === 'admin' || user.email?.toLowerCase() === LEGACY_ADMIN_EMAIL;
}
