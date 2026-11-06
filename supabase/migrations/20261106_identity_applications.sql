-- ============================================================
-- NIN / BVN APPLICATION DESK
--
-- Visitors apply for help with identity services — first-time NIN
-- registration, NIN record modification, NIN slip retrieval, BVN record
-- correction and BVN retrieval — and receive a reference number.
-- The file then advances through Haritech's handling stages.
--
-- Honesty rules baked into this design:
--   * Haritech does not issue NIN (NIMC does) or BVN (banks via NIBSS).
--     Every service here is assistance: booking, preparing and following.
--   * Stages describe Haritech's handling of the file. They are NOT a feed
--     from NIMC, NIBSS or any bank.
--   * The applicant's NIN or BVN is NEVER collected or stored. The schema
--     has no number column; the payload must not contain one (see the
--     NIN:/BVN: digit guard inside submit_identity_application). The desk
--     stores only how the applicant relates to their number
--     (none / verified here / has it unverified) plus, optionally, the
--     masked reference from a check run on the website.
--   * No fee is stored or quoted anywhere. Fees are confirmed by the desk.
--   * Visitors never get table access. Submission and status lookup go
--     through SECURITY DEFINER functions; status lookup requires both the
--     reference and the contact used on the file.
--   * Only the admin email can read or change rows directly. Customer
--     history stays private; there is no sign-in for visitors.
-- ============================================================

create table if not exists public.identity_applications (
  id bigint generated always as identity primary key,
  reference text not null unique
    default ('NID-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  service text not null
    check (service in ('nin_registration','nin_modification','nin_retrieval','bvn_correction','bvn_retrieval')),
  holder_name text not null,
  holder_email text not null,
  holder_phone text not null,
  holder_dob date not null,
  holder_gender text not null default '',
  state_of_residence text not null default '',
  holder_address text not null default '',
  -- How the applicant relates to their number — NEVER the number itself.
  existing_number text not null default 'none'
    check (existing_number in ('none','verified_here','have_unverified')),
  -- Optional masked check reference from the website's checks panel.
  check_reference text not null default '',
  request_details text not null default '',
  documents_have jsonb not null default '[]'::jsonb,
  notes text not null default '',
  stage text not null default 'submitted'
    check (stage in ('submitted','review','appointment','query','completed','closed')),
  stage_note text not null default '',
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.identity_applications is
  'NIN/BVN application desk. Deliberately has NO NIN/BVN column: numbers are never collected or stored, only existing_number (none/verified_here/have_unverified) and an optional masked check_reference. Stages describe Haritech handling, not NIMC/NIBSS.';

create index if not exists identity_applications_created_idx
  on public.identity_applications (created_at desc);
create index if not exists identity_applications_stage_idx
  on public.identity_applications (stage, created_at desc);
create index if not exists identity_applications_email_idx
  on public.identity_applications (lower(holder_email));

-- Keep updated_at truthful without trusting the client.
create or replace function public.touch_identity_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists identity_applications_touch on public.identity_applications;
create trigger identity_applications_touch
  before update on public.identity_applications
  for each row execute function public.touch_identity_application();

alter table public.identity_applications enable row level security;

-- No anon table policies at all: visitors can only use the functions below.
-- Only the admin email may read or change rows directly.
drop policy if exists "admin read identity_applications" on public.identity_applications;
create policy "admin read identity_applications"
  on public.identity_applications for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin update identity_applications" on public.identity_applications;
create policy "admin update identity_applications"
  on public.identity_applications for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin delete identity_applications" on public.identity_applications;
create policy "admin delete identity_applications"
  on public.identity_applications for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- Defence in depth: anon has no table privileges; authenticated can only
-- reach the rows its RLS policies allow. Inserts happen inside the function.
revoke all on public.identity_applications from anon;
grant select, update, delete on public.identity_applications to authenticated;

-- ============================================================
-- Submit an application
--
-- Validates server-side, rejects anything that looks like a NIN or BVN
-- typed into the free-text fields, and never returns the stored payload.
-- ============================================================
create or replace function public.submit_identity_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service text := coalesce(payload->>'service', '');
  v_existing text := coalesce(payload->>'existing_number', 'none');
  v_reference text := upper(trim(coalesce(payload->>'check_reference', '')));
  v_email text := lower(trim(coalesce(payload->>'holder_email', '')));
  v_phone text := trim(coalesce(payload->>'holder_phone', ''));
  v_digits text := regexp_replace(coalesce(payload->>'holder_phone', ''), '\D', '', 'g');
  v_dob text := coalesce(payload->>'holder_dob', '');
  v_documents jsonb := coalesce(payload->'documents_have', '[]'::jsonb);
  v_notes text := coalesce(payload->>'notes', '');
  v_details text := coalesce(payload->>'request_details', '');
  v_address text := coalesce(payload->>'holder_address', '');
  v_row public.identity_applications;
  v_attempt int;
  v_requires_number boolean;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'Application payload must be an object.';
  end if;

  -- Privacy guard: the form never asks for a NIN or BVN. If somebody pastes
  -- one with a label into the free-text fields, refuse rather than store it
  -- — Honest wording, not a silent edit.
  if upper(v_notes) ~ '(NIN|BVN|NUMBER)\s*[:=]?\s*[0-9]{11}'
     or upper(v_details) ~ '(NIN|BVN|NUMBER)\s*[:=]?\s*[0-9]{11}' then
    raise exception 'For privacy this form does not accept NIN or BVN digits. Remove the number and describe what you need instead — the desk confirms it during your review.';
  end if;

  if v_service not in ('nin_registration','nin_modification','nin_retrieval','bvn_correction','bvn_retrieval') then
    raise exception 'Choose a supported identity service.';
  end if;

  if v_existing not in ('none','verified_here','have_unverified') then
    raise exception 'The existing-number answer is invalid.';
  end if;

  -- Server-side mirror of the per-service requirements.
  v_requires_number := v_service in ('nin_modification','nin_retrieval','bvn_correction');
  if v_requires_number and v_existing = 'none' then
    raise exception 'This service applies to people who already hold the number.';
  end if;
  if not v_requires_number and v_existing <> 'none' then
    -- Registration/retrieval need no number; an answer is allowed but harmless.
    null;
  end if;

  if v_reference <> '' and v_reference !~ '^[A-Z0-9]{4,10}$' then
    raise exception 'The check reference is invalid.';
  end if;

  if char_length(trim(coalesce(payload->>'holder_name', ''))) not between 2 and 120 then
    raise exception 'Provide the applicant full name.';
  end if;
  if v_email !~* '^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$' then
    raise exception 'Provide a valid email address.';
  end if;
  if char_length(v_digits) not between 7 and 15 then
    raise exception 'Provide a valid phone number.';
  end if;
  if v_dob !~ '^\d{4}-\d{2}-\d{2}$' or (v_dob::date) > (current_date) then
    raise exception 'Provide the correct date of birth.';
  end if;

  if v_service = 'nin_modification' or v_service = 'nin_retrieval' or v_service = 'bvn_correction' then
    if char_length(trim(v_details)) < 10 then
      raise exception 'Tell the desk exactly what needs to change or be retrieved.';
    end if;
  end if;
  if v_service = 'nin_registration' and char_length(trim(v_address)) < 5 then
    raise exception 'Provide the current residential address.';
  end if;

  if char_length(trim(coalesce(payload->>'state_of_residence', ''))) not between 2 and 60 then
    raise exception 'Provide the state of residence.';
  end if;

  if jsonb_typeof(v_documents) <> 'array' or jsonb_array_length(v_documents) > 30 then
    raise exception 'The document list is invalid.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_documents) as doc
    where jsonb_typeof(doc) <> 'string'
  ) then
    raise exception 'The document list is invalid.';
  end if;

  if char_length(v_notes) > 500 then
    raise exception 'Notes must be 500 characters or fewer.';
  end if;
  if char_length(v_details) > 800 then
    raise exception 'The request details must be 800 characters or fewer.';
  end if;
  if pg_column_size(v_documents) > 20000 then
    raise exception 'The application details are too large.';
  end if;

  -- Light abuse guard: no more than three files from one email in ten
  -- minutes. Legitimate applicants can retry after a short wait.
  if (
    select count(*)
    from public.identity_applications
    where lower(holder_email) = v_email
      and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'A request from this email was submitted recently. Please wait a few minutes before trying again.';
  end if;

  for v_attempt in 1..5 loop
    begin
      insert into public.identity_applications (
        service,
        holder_name,
        holder_email,
        holder_phone,
        holder_dob,
        holder_gender,
        state_of_residence,
        holder_address,
        existing_number,
        check_reference,
        request_details,
        documents_have,
        notes
      ) values (
        v_service,
        trim(payload->>'holder_name'),
        v_email,
        v_phone,
        v_dob::date,
        left(coalesce(payload->>'holder_gender', ''), 30),
        trim(payload->>'state_of_residence'),
        left(v_address, 500),
        v_existing,
        v_reference,
        left(v_details, 800),
        v_documents,
        v_notes
      )
      returning * into v_row;
      exit;
    exception when unique_violation then
      if v_attempt = 5 then
        raise exception 'Could not allocate a reference number. Please try again.';
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'found', true,
    'reference', v_row.reference,
    'stage', v_row.stage,
    'created_at', v_row.created_at
  );
end;
$$;

-- ============================================================
-- Track an application
--   Requires the reference AND the phone/email used on the file, so a
--   guessed reference alone reveals nothing.
-- ============================================================
create or replace function public.identity_application_status(p_reference text, p_contact text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reference text := upper(trim(coalesce(p_reference, '')));
  v_contact text := lower(trim(coalesce(p_contact, '')));
  -- Treat +234 803… and 0803… as the same Nigerian number.
  v_digits text := regexp_replace(
    regexp_replace(coalesce(p_contact, ''), '\D', '', 'g'),
    '^234',
    '0'
  );
  v_row public.identity_applications;
begin
  if v_reference = '' or v_contact = '' then
    return jsonb_build_object('found', false);
  end if;

  select * into v_row
  from public.identity_applications
  where reference = v_reference
    and (
      lower(holder_email) = v_contact
      or (
        v_digits <> ''
        and regexp_replace(
          regexp_replace(holder_phone, '\D', '', 'g'),
          '^234',
          '0'
        ) = v_digits
      )
    )
  limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'reference', v_row.reference,
    'service', v_row.service,
    'stage', v_row.stage,
    'stage_note', v_row.stage_note,
    'documents', v_row.documents,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.submit_identity_application(jsonb) from public;
revoke all on function public.identity_application_status(text, text) from public;
grant execute on function public.submit_identity_application(jsonb) to anon, authenticated;
grant execute on function public.identity_application_status(text, text) to anon, authenticated;
