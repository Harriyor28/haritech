-- ============================================================
-- HARITECH — Supabase setup
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- (Safe to re-run: every section is idempotent.)
-- ============================================================

-- 1. Key-value table that stores ALL site content
create table if not exists public.site_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_data enable row level security;

create policy "public read site_data"
  on public.site_data for select
  using (true);

create policy "admin write site_data"
  on public.site_data
  for all
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

alter publication supabase_realtime add table public.site_data;

-- ============================================================
-- 2. WEBSITE ENQUIRIES  (contact form / quote request / newsletter)
--    Server-side enforced doors:
--      * anonymous visitors may only INSERT
--      * rows become INSERT-locked once notification_status is set
--        (the notification worker marks rows as handled)
--      * only the admin email may SELECT / UPDATE / DELETE
-- ============================================================
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  form text not null default 'contact',
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  budget text,
  timeline text,
  contact_method text,
  category text,
  consent_marketing boolean not null default false,
  source_page text,
  user_agent text,
  status text not null default 'new'
    check (status in ('new','in_progress','resolved','spam')),
  notification_status text not null default 'pending'
    check (notification_status in ('pending','sent','failed','disabled')),
  notification_error text,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

-- upgrade path for already-created tables
alter table public.contact_messages add column if not exists category text;
alter table public.contact_messages add column if not exists consent_marketing boolean not null default false;
alter table public.contact_messages add column if not exists source_page text;
alter table public.contact_messages add column if not exists user_agent text;
alter table public.contact_messages add column if not exists status text not null default 'new';
alter table public.contact_messages add column if not exists notification_status text not null default 'pending';
alter table public.contact_messages add column if not exists notification_error text;
alter table public.contact_messages add column if not exists notified_at timestamptz;

alter table public.contact_messages enable row level security;

-- Visitors can only create enquiries — never read other customers' messages
create policy "public insert contact_messages"
  on public.contact_messages for insert
  to anon
  with check (
    char_length(name) between 2 and 120
    and email ~* '^[^<>@ ]+@[^<>@ ]+\.[^<>@ ]+$'
    and char_length(message) between 2 and 5000
    and status = 'new'
    and notification_status = 'pending'
    and notification_error is null
    and notified_at is null
  );

-- Admin-only full access
create policy "admin read contact_messages"
  on public.contact_messages for select
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

create policy "admin update contact_messages"
  on public.contact_messages for update
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

create policy "admin delete contact_messages"
  on public.contact_messages for delete
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

alter publication supabase_realtime add table public.contact_messages;

-- ============================================================
-- 3. Aggregate site events (chat opened, whatsapp clicked, enquiry submitted)
-- ============================================================
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists site_events_created_idx
  on public.site_events (created_at desc);

alter table public.site_events enable row level security;

create policy "public insert site_events"
  on public.site_events for insert
  to anon
  with check (char_length(event) between 1 and 60 and char_length(label) <= 60);

create policy "admin read site_events"
  on public.site_events for select
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- ============================================================
-- 4. Simple per-minute anonymous insert throttle
--    (defense in depth on top of RLS; complements client throttling)
-- ============================================================
create table if not exists public.enquiry_throttle (
  ip text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

create or replace function public.enquiry_throttle_check()
returns trigger as $$
declare
  this_minute int;
begin
  insert into public.enquiry_throttle (ip, window_start, count)
  values (inet_client_addr()::text, date_trunc('minute', now()), 1)
  on conflict (ip) do update
    set count = case
      when enquiry_throttle.window_start = date_trunc('minute', now())
        then enquiry_throttle.count + 1
      else 1
    end,
    window_start = date_trunc('minute', now());

  select count into this_minute from public.enquiry_throttle
  where ip = inet_client_addr()::text;

  if this_minute > 5 then
    raise exception 'Too many enquiries from this address, please try again shortly.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists enquiry_throttle_trigger on public.contact_messages;
create trigger enquiry_throttle_trigger
  before insert on public.contact_messages
  for each row execute function public.enquiry_throttle_check();

-- ============================================================
-- 5. CLIENT PORTAL — projects assigned to individual clients
--    Row Level Security guarantees a signed-in client can only ever
--    SELECT their own rows; nobody but the admin can write.
-- ============================================================
create table if not exists public.client_projects (
  id bigint generated always as identity primary key,
  client_email text not null,              -- the client's Supabase auth email
  title text not null,
  client text not null default '',         -- organisation / household name
  category text not null default '',
  phase text not null default 'Discovery & Scope',
  status text not null default 'Active'
    check (status in ('Active','Completed','On hold','Cancelled')),
  progress int not null default 0 check (progress between 0 and 100),
  planned int not null default 0 check (planned between 0 and 100),
  summary text not null default '',
  owner text not null default '',          -- named project lead
  target_date date,
  budget_naira bigint not null default 0,
  spent_naira bigint not null default 0,
  next_milestone text not null default '',
  milestones jsonb not null default '[]'::jsonb,   -- [{title, done}]
  documents jsonb not null default '[]'::jsonb,    -- [{name, status}]
  updates jsonb not null default '[]'::jsonb,      -- [{date, text}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_projects_email_idx
  on public.client_projects (lower(client_email));

alter table public.client_projects enable row level security;

-- Signed-in clients: their own rows only (case-insensitive match), read-only.
drop policy if exists "client read own projects" on public.client_projects;
create policy "client read own projects"
  on public.client_projects for select
  to authenticated
  using (lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Admin: full access, matching the email policy used everywhere else.
drop policy if exists "admin read client_projects" on public.client_projects;
create policy "admin read client_projects"
  on public.client_projects for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin insert client_projects" on public.client_projects;
create policy "admin insert client_projects"
  on public.client_projects for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin update client_projects" on public.client_projects;
create policy "admin update client_projects"
  on public.client_projects for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin delete client_projects" on public.client_projects;
create policy "admin delete client_projects"
  on public.client_projects for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- ============================================================
-- 6. PORTAL APPROVALS — items waiting on a client's decision
--    Clients may only respond (via the security-definer function
--    below, which touches status + responded_at and nothing else);
--    only the admin can create or edit approvals.
-- ============================================================
create table if not exists public.client_approvals (
  id bigint generated always as identity primary key,
  client_email text not null,
  project_id bigint references public.client_projects(id) on delete cascade,
  title text not null,
  detail text not null default '',
  amount_naira bigint not null default 0,
  status text not null default 'Pending'
    check (status in ('Pending','Approved','Declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists client_approvals_email_idx
  on public.client_approvals (lower(client_email));

alter table public.client_approvals enable row level security;

drop policy if exists "client read own approvals" on public.client_approvals;
create policy "client read own approvals"
  on public.client_approvals for select
  to authenticated
  using (lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "admin read client_approvals" on public.client_approvals;
create policy "admin read client_approvals"
  on public.client_approvals for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin insert client_approvals" on public.client_approvals;
create policy "admin insert client_approvals"
  on public.client_approvals for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin update client_approvals" on public.client_approvals;
create policy "admin update client_approvals"
  on public.client_approvals for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin delete client_approvals" on public.client_approvals;
create policy "admin delete client_approvals"
  on public.client_approvals for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- Clients respond to their own approvals. SECURITY DEFINER so the
-- caller never needs UPDATE rights on the table itself: the function
-- verifies ownership, only flips Pending rows, and writes nothing but
-- status + responded_at.
create or replace function public.respond_to_approval(p_id bigint, p_decision text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_decision not in ('Approved', 'Declined') then
    raise exception 'Invalid decision';
  end if;
  update public.client_approvals
     set status = p_decision, responded_at = now()
   where id = p_id
     and status = 'Pending'
     and lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''));
  if not found then
    raise exception 'Not authorised to respond to this approval';
  end if;
end;
$$;

revoke execute on function public.respond_to_approval(bigint, text) from public, anon;
grant execute on function public.respond_to_approval(bigint, text) to authenticated;

-- ============================================================
-- 7. CLIENT MESSAGES — thread between a client and the admin
--    Clients write rows marked sender='client' for their own email;
--    the admin can read everything and write sender='admin' replies.
-- ============================================================
create table if not exists public.client_messages (
  id bigint generated always as identity primary key,
  client_email text not null,
  project_id bigint references public.client_projects(id) on delete set null,
  sender text not null check (sender in ('client', 'admin')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists client_messages_email_idx
  on public.client_messages (lower(client_email), created_at);

alter table public.client_messages enable row level security;

drop policy if exists "client read own messages" on public.client_messages;
create policy "client read own messages"
  on public.client_messages for select
  to authenticated
  using (lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "client insert own messages" on public.client_messages;
create policy "client insert own messages"
  on public.client_messages for insert
  to authenticated
  with check (
    sender = 'client'
    and lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "admin read client_messages" on public.client_messages;
create policy "admin read client_messages"
  on public.client_messages for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin insert client_messages" on public.client_messages;
create policy "admin insert client_messages"
  on public.client_messages for insert
  to authenticated
  with check (
    sender = 'admin'
    and (auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com'
  );

drop policy if exists "admin delete client_messages" on public.client_messages;
create policy "admin delete client_messages"
  on public.client_messages for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- ============================================================
-- After running the SQL above:
--
-- 4. Create your admin login:
--    Dashboard -> Authentication -> Users -> Add user
--    Email:  the SAME email you put in the policy
--    Password: choose a strong password
--
-- 4b. Create client logins for the Client Portal:
--    Dashboard -> Authentication -> Users -> Add user
--    Email:  the client's email (must match client_email on their rows)
--    Password: send it to them through a private channel
--    Then assign them projects in Admin -> Project Manager
--    -> Client Assignments. There is no public sign-up by design.
--
-- 5. Copy your project URL + anon key into the .env file
--    (Project Settings -> API -> Project URL / anon public key)
--
-- 6. Email notifications: deploy the Edge Function:
--      cd supabase
--      npx supabase functions deploy enquiries-notify
--      npx supabase secrets set RESEND_API_KEY=re_xxx OWNER_EMAIL=you@biz.com
--    (see supabase/functions/enquiries-notify/README.md)
--
-- 7. Re-run this file any time before/after code changes — it is
--    written to be idempotent.
-- ============================================================
