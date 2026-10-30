-- ============================================================
-- HARITECH — Solar Advisor / Monitor customer history
-- STATUS: DRAFT — NOT APPLIED. Review before running.
-- Run in: Supabase Dashboard -> SQL Editor -> New query
-- (Idempotent: safe to re-run.)
--
-- Why this file exists
--   The Designer and Monitor currently keep assessments and readings in the
--   customer's browser only (localStorage). This migration adds an optional
--   server copy that survives a cleared browser or a device change.
--
-- Design constraints it must satisfy
--   1. No customer sign-in. There is no auth account to key rows on, so each
--      browser generates a 256-bit random "owner token" once and keeps it in
--      localStorage. Only the SHA-256 hash of that token reaches the database.
--   2. Rows are private. The table has RLS enabled and ZERO policies, and all
--      table privileges are revoked from anon/authenticated. Every read and
--      write goes through a SECURITY DEFINER function that compares the hash.
--      A visitor who guesses nothing gets nothing.
--   3. Permanent delete. The owner can delete one record or all of them.
--   4. Retention. Rows expire after 24 months (change the interval below if
--      a longer period is approved). Expired rows are hidden on read and can
--      be purged by a scheduled job.
--   5. No secrets. The payload is solar sizing / reading data only. The token
--      itself is never stored, only its hash. No inverter password, API key
--      or access token belongs in this table.
--
-- Known trade-off
--   The token is the only credential. Anyone who obtains it (for example from
--   a shared computer's localStorage) can read and delete that device's rows.
--   Clearing site data loses access to previously saved rows. Both facts must
--   be stated in the UI before this is switched on.
-- ============================================================

-- pgcrypto supplies digest(). Supabase installs it into the extensions schema.
create extension if not exists pgcrypto with schema extensions;

-- ------------------------------------------------------------
-- 1. One table for both record kinds
-- ------------------------------------------------------------
create table if not exists public.solar_customer_records (
  id bigint generated always as identity primary key,
  -- SHA-256 hex of the device token. The token itself is never stored.
  owner_token_hash text not null,
  kind text not null check (kind in ('assessment', 'reading')),
  label text not null default '',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  -- Retention. Change '24 months' here if a longer period is approved.
  expires_at timestamptz not null default (now() + interval '24 months'),
  constraint solar_customer_records_label_len
    check (char_length(label) <= 120),
  constraint solar_customer_records_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint solar_customer_records_payload_size
    check (pg_column_size(payload) <= 65536)
);

create index if not exists solar_customer_records_owner_idx
  on public.solar_customer_records (owner_token_hash, kind, created_at desc);

create index if not exists solar_customer_records_expiry_idx
  on public.solar_customer_records (expires_at);

alter table public.solar_customer_records enable row level security;

-- No policies are created on purpose: with RLS on and no policy, anon and
-- authenticated can neither read nor write. The functions below are the only
-- door. Revoking table privileges as well is defence in depth.
revoke all on public.solar_customer_records from anon, authenticated;

-- ------------------------------------------------------------
-- 2. Token hashing helper
-- ------------------------------------------------------------
create or replace function public.solar_owner_hash(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(digest(p_token, 'sha256'), 'hex');
$$;

-- ------------------------------------------------------------
-- 3. Save one record (assessment or reading)
-- ------------------------------------------------------------
create or replace function public.solar_records_save(
  p_token text,
  p_kind text,
  p_label text,
  p_payload jsonb
) returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_id bigint;
  v_count int;
begin
  -- The client always sends 32 random bytes as 64 lowercase hex characters.
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid device token';
  end if;

  if p_kind is null or p_kind not in ('assessment', 'reading') then
    raise exception 'Invalid record kind';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Record payload must be a JSON object';
  end if;

  if pg_column_size(p_payload) > 65536 then
    raise exception 'Record payload is too large';
  end if;

  v_hash := public.solar_owner_hash(p_token);

  -- Per-device cap so a single browser cannot fill the table.
  select count(*) into v_count
    from public.solar_customer_records
   where owner_token_hash = v_hash
     and kind = p_kind;

  if v_count >= 200 then
    raise exception 'This device has reached its saved-record limit. Delete an older record first.';
  end if;

  insert into public.solar_customer_records (owner_token_hash, kind, label, payload)
  values (v_hash, p_kind, left(coalesce(p_label, ''), 120), p_payload)
  returning id into v_id;

  return v_id;
end;
$$;

-- ------------------------------------------------------------
-- 4. List this device's records (expired rows are hidden)
-- ------------------------------------------------------------
create or replace function public.solar_records_list(
  p_token text,
  p_kind text default null
) returns table (
  id bigint,
  kind text,
  label text,
  payload jsonb,
  created_at timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select r.id, r.kind, r.label, r.payload, r.created_at, r.expires_at
    from public.solar_customer_records r
   where p_token is not null
     and r.owner_token_hash = public.solar_owner_hash(p_token)
     and (p_kind is null or r.kind = p_kind)
     and r.expires_at > now()
   order by r.created_at desc
   limit 200;
$$;

-- ------------------------------------------------------------
-- 5. Permanent delete — one record, or everything on this device
-- ------------------------------------------------------------
create or replace function public.solar_records_delete(
  p_token text,
  p_id bigint
) returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  v_hash := public.solar_owner_hash(p_token);

  delete from public.solar_customer_records
   where id = p_id
     and owner_token_hash = v_hash;

  return found;
end;
$$;

create or replace function public.solar_records_delete_all(
  p_token text,
  p_kind text default null
) returns int
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
  v_deleted int;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return 0;
  end if;

  v_hash := public.solar_owner_hash(p_token);

  delete from public.solar_customer_records
   where owner_token_hash = v_hash
     and (p_kind is null or kind = p_kind);

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ------------------------------------------------------------
-- 6. Retention purge — scheduled job only, not exposed to visitors
-- ------------------------------------------------------------
create or replace function public.solar_records_purge_expired()
returns int
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_deleted int;
begin
  delete from public.solar_customer_records where expires_at <= now();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ------------------------------------------------------------
-- 7. Grants — visitors may only use the token-checked functions
-- ------------------------------------------------------------
revoke all on function public.solar_owner_hash(text) from public;
revoke all on function public.solar_records_save(text, text, text, jsonb) from public;
revoke all on function public.solar_records_list(text, text) from public;
revoke all on function public.solar_records_delete(text, bigint) from public;
revoke all on function public.solar_records_delete_all(text, text) from public;
revoke all on function public.solar_records_purge_expired() from public;

grant execute on function public.solar_owner_hash(text) to anon, authenticated;
grant execute on function public.solar_records_save(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.solar_records_list(text, text) to anon, authenticated;
grant execute on function public.solar_records_delete(text, bigint) to anon, authenticated;
grant execute on function public.solar_records_delete_all(text, text) to anon, authenticated;
-- solar_records_purge_expired stays service_role only.

-- ------------------------------------------------------------
-- 8. Optional: scheduled purge
--    Enable pg_cron, then (adjust the schedule as needed):
--
--    select cron.schedule(
--      'solar-purge-expired',
--      '0 3 * * *',
--      $$ select public.solar_records_purge_expired(); $$
--    );
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 9. OPTIONAL — admin visibility. OFF by default.
--    Enabling this lets the owner email read every customer's records.
--    It contradicts the "private to this browser" promise currently shown on
--    the Monitor page, so only uncomment after the UI wording is changed and
--    the customer has been told.
--
-- create policy "admin read solar_customer_records"
--   on public.solar_customer_records for select
--   to authenticated
--   using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');
-- ------------------------------------------------------------

-- ============================================================
-- After applying:
--   1. Set SOLAR_CLOUD_HISTORY_ENABLED = true in
--      src/utils/solar/cloudHistory.ts
--   2. Wire listCloudRecords / saveCloudRecord / deleteCloudRecord into
--      src/pages/haritech/SolarAdvisor.tsx and SolarMonitor.tsx
--   3. Add the retention + "clearing site data loses access" wording to both
--      pages before the feature is announced.
-- ============================================================
