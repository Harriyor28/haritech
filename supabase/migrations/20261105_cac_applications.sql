-- ============================================================
-- CAC APPLICATION DESK
--
-- A guided application file for CAC registration assistance:
--   1. the visitor submits an application (Business Name, Ltd, NGO or
--      Incorporated Trustees) and receives a reference number;
--   2. the reference + phone/email lets that same visitor track progress
--      and download documents Haritech publishes;
--   3. the Haritech admin advances the stage and publishes documents.
--
-- Honesty rules baked into this design:
--   * Stages describe Haritech's handling of the file. They are NOT a feed
--     from the Corporate Affairs Commission's internal system.
--   * Visitors never get table access. Submission and status lookup go
--     through SECURITY DEFINER functions; status lookup requires both the
--     reference and the contact used on the application.
--   * Only the admin email can read or change rows directly.
-- ============================================================

create table if not exists public.cac_applications (
  id bigint generated always as identity primary key,
  reference text not null unique
    default ('CAC-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  entity_type text not null
    check (entity_type in ('business_name','limited_company','ngo','incorporated_trustees')),
  proposed_names text[] not null,
  nature_of_business text not null default '',
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  applicant_address text not null default '',
  business_address text not null default '',
  members jsonb not null default '[]'::jsonb,
  documents_have jsonb not null default '[]'::jsonb,
  notes text not null default '',
  stage text not null default 'submitted'
    check (stage in ('submitted','name_search','filed','query','approved','certificate_ready','closed')),
  stage_note text not null default '',
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cac_applications_created_idx
  on public.cac_applications (created_at desc);
create index if not exists cac_applications_stage_idx
  on public.cac_applications (stage, created_at desc);
create index if not exists cac_applications_email_idx
  on public.cac_applications (lower(applicant_email));

-- Keep updated_at truthful without trusting the client.
create or replace function public.touch_cac_application()
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

drop trigger if exists cac_applications_touch on public.cac_applications;
create trigger cac_applications_touch
  before update on public.cac_applications
  for each row execute function public.touch_cac_application();

alter table public.cac_applications enable row level security;

-- No anon table policies at all: visitors can only use the functions below.
-- Only the admin email may read or change rows directly.
drop policy if exists "admin read cac_applications" on public.cac_applications;
create policy "admin read cac_applications"
  on public.cac_applications for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin update cac_applications" on public.cac_applications;
create policy "admin update cac_applications"
  on public.cac_applications for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin delete cac_applications" on public.cac_applications;
create policy "admin delete cac_applications"
  on public.cac_applications for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- Defence in depth: anon has no table privileges; authenticated can only
-- reach the rows its RLS policies allow. Inserts happen inside the function.
revoke all on public.cac_applications from anon;
grant select, update, delete on public.cac_applications to authenticated;

-- ============================================================
-- Submit an application
-- ============================================================
create or replace function public.submit_cac_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity text := coalesce(payload->>'entity_type', '');
  v_raw_names jsonb := coalesce(payload->'proposed_names', '[]'::jsonb);
  v_name text;
  v_names text[] := '{}';
  v_members jsonb := coalesce(payload->'members', '[]'::jsonb);
  v_documents jsonb := coalesce(payload->'documents_have', '[]'::jsonb);
  v_email text := lower(trim(coalesce(payload->>'applicant_email', '')));
  v_phone text := trim(coalesce(payload->>'applicant_phone', ''));
  v_digits text := regexp_replace(coalesce(payload->>'applicant_phone', ''), '\D', '', 'g');
  v_notes text := coalesce(payload->>'notes', '');
  v_row public.cac_applications;
  v_attempt int;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'Application payload must be an object.';
  end if;

  if v_entity not in ('business_name','limited_company','ngo','incorporated_trustees') then
    raise exception 'Choose a supported registration type.';
  end if;

  if jsonb_typeof(v_raw_names) <> 'array' then
    raise exception 'Provide at least one proposed name.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_raw_names) as name
    where jsonb_typeof(name) <> 'string'
  ) then
    raise exception 'Proposed names must be text.';
  end if;
  if jsonb_array_length(v_raw_names) > 5 then
    raise exception 'Provide no more than five proposed names.';
  end if;
  for v_name in select trim(value) from jsonb_array_elements_text(v_raw_names) loop
    if char_length(v_name) between 2 and 120 then
      v_names := array_append(v_names, v_name);
    end if;
  end loop;
  if coalesce(array_length(v_names, 1), 0) = 0 then
    raise exception 'Provide at least one proposed name (2-120 characters).';
  end if;

  if char_length(trim(coalesce(payload->>'applicant_name', ''))) not between 2 and 120 then
    raise exception 'Provide the applicant full name.';
  end if;
  if v_email !~* '^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$' then
    raise exception 'Provide a valid email address.';
  end if;
  if char_length(v_digits) not between 7 and 15 then
    raise exception 'Provide a valid phone number.';
  end if;

  if jsonb_typeof(v_members) <> 'array' or jsonb_array_length(v_members) > 20 then
    raise exception 'The member list is invalid.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_members) as member
    where jsonb_typeof(member) <> 'object'
  ) then
    raise exception 'The member list is invalid.';
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

  if char_length(v_notes) > 2000 then
    raise exception 'Notes must be 2000 characters or fewer.';
  end if;
  if pg_column_size(v_members) > 20000 or pg_column_size(v_documents) > 20000 then
    raise exception 'The application details are too large.';
  end if;

  -- Light abuse guard: no more than three files from one email in ten
  -- minutes. Legitimate applicants can retry after a short wait.
  if (
    select count(*)
    from public.cac_applications
    where lower(applicant_email) = v_email
      and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'An application from this email was submitted recently. Please wait a few minutes before trying again.';
  end if;

  for v_attempt in 1..5 loop
    begin
      insert into public.cac_applications (
        entity_type,
        proposed_names,
        nature_of_business,
        applicant_name,
        applicant_email,
        applicant_phone,
        applicant_address,
        business_address,
        members,
        documents_have,
        notes
      ) values (
        v_entity,
        v_names,
        left(coalesce(payload->>'nature_of_business', ''), 500),
        trim(payload->>'applicant_name'),
        v_email,
        v_phone,
        left(coalesce(payload->>'applicant_address', ''), 500),
        left(coalesce(payload->>'business_address', ''), 500),
        v_members,
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
create or replace function public.cac_application_status(p_reference text, p_contact text)
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
  v_row public.cac_applications;
begin
  if v_reference = '' or v_contact = '' then
    return jsonb_build_object('found', false);
  end if;

  select * into v_row
  from public.cac_applications
  where reference = v_reference
    and (
      lower(applicant_email) = v_contact
      or (
        v_digits <> ''
        and regexp_replace(
          regexp_replace(applicant_phone, '\D', '', 'g'),
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
    'entity_type', v_row.entity_type,
    'proposed_names', v_row.proposed_names,
    'stage', v_row.stage,
    'stage_note', v_row.stage_note,
    'documents', v_row.documents,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.submit_cac_application(jsonb) from public;
revoke all on function public.cac_application_status(text, text) from public;
grant execute on function public.submit_cac_application(jsonb) to anon, authenticated;
grant execute on function public.cac_application_status(text, text) to anon, authenticated;
