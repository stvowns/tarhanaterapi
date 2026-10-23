-- TarhanaTerapi — bülten / e-kitap açık rıza kaydı
-- Supabase SQL Editor veya `supabase db push` ile uygulanır.
--
-- marketing_consent: ticari elektronik ileti / bülten onayı.
-- consent_at: onayın sunucuda kaydedildiği zaman.
-- consent_version: onay metninin sürümü.
-- consent_source: onayın hangi formdan geldiği (ebook / newsletter).

alter table public.subscribers
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text,
  add column if not exists consent_source text;

comment on column public.subscribers.marketing_consent is
  'Ticari elektronik ileti / bülten için açık rıza. Varsayılan false.';
comment on column public.subscribers.consent_at is
  'Açık rızanın sunucuda kaydedildiği zaman.';
comment on column public.subscribers.consent_version is
  'Kullanıcıya gösterilen onay metninin sürümü.';
comment on column public.subscribers.consent_source is
  'Onayın alındığı form: ebook veya newsletter.';
