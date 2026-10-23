/**
 * Yönetici görünürlüğü için tek kaynak.
 *
 * Supabase `app_metadata.role === 'admin'` kontrolü.
 * Sunucu tarafındaki gerçek yetki kontrolü `functions/_lib/admin.js` içindedir.
 */
type AdminCandidate = {
  email?: string | null;
  app_metadata?: Record<string, unknown> | null;
};

export function isAdminUser(user: AdminCandidate | null | undefined): boolean {
  if (!user) return false;
  const role = String(user.app_metadata?.role || '').toLowerCase();
  return role === 'admin';
}
