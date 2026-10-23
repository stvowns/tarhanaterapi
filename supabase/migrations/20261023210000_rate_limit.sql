-- TarhanaTerapi — kalıcı rate limit bucket'ları
-- Cloudflare kuralı birincil katman; bu tablo uygulama düzeyinde ikinci katman.
-- Yalnızca service_role erişebilir; anon/authenticated için RLS + yetki kapalı.

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

create index if not exists rate_limit_buckets_window_start_idx
  on public.rate_limit_buckets (window_start);

alter table public.rate_limit_buckets enable row level security;

revoke all on public.rate_limit_buckets from anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_hits integer;
begin
  if p_key is null
     or length(p_key) = 0
     or p_limit < 1
     or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limit_buckets as buckets (bucket_key, window_start, hits)
  values (p_key, v_now, 1)
  on conflict (bucket_key) do update
    set window_start = case
          when buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
          then v_now
          else buckets.window_start
        end,
        hits = case
          when buckets.window_start <= v_now - make_interval(secs => p_window_seconds)
          then 1
          else buckets.hits + 1
        end
  returning hits into v_hits;

  -- Ara sıra eski bucket'ları temizle; tablo sınırsız büyümesin.
  if random() < 0.01 then
    delete from public.rate_limit_buckets
    where window_start < v_now - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;
