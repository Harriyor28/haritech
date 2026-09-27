-- ============================================================
-- HARITECH — Supabase setup
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. Key-value table that stores ALL site content
create table if not exists public.site_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.site_data enable row level security;

-- 3. Anyone can READ (visitors see the live content)
create policy "public read site_data"
  on public.site_data for select
  using (true);

-- 4. Only the admin email can WRITE (change the email below to YOURS)
create policy "admin write site_data"
  on public.site_data
  for all
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- 5. Enable REALTIME so visitor pages update instantly when you save
alter publication supabase_realtime add table public.site_data;

-- ============================================================
-- HARITECH — first-party analytics (page views)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. Table that stores one row per page view
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.page_views enable row level security;

-- 3. Anyone can RECORD a view (tracker uses the anon key, no login)
drop policy if exists "public insert page_views" on public.page_views;
create policy "public insert page_views"
  on public.page_views for insert
  with check (true);

-- 4. Only the admin email can READ stats (change the email to YOURS)
drop policy if exists "admin read page_views" on public.page_views;
create policy "admin read page_views"
  on public.page_views for select
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

-- 5. Index for fast dashboard queries
create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);

-- ============================================================
-- HARITECH — contact messages (form submissions from the site)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  form text not null default 'contact',
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  subject text not null default '',
  message text not null default '',
  budget text not null default '',
  timeline text not null default '',
  contact_method text not null default '',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Visitors can SEND messages (anon key, no login required)
drop policy if exists "public insert contact_messages" on public.contact_messages;
create policy "public insert contact_messages"
  on public.contact_messages for insert
  with check (true);

-- Only the admin email can READ / DELETE messages
drop policy if exists "admin read contact_messages" on public.contact_messages;
create policy "admin read contact_messages"
  on public.contact_messages for select
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

drop policy if exists "admin delete contact_messages" on public.contact_messages;
create policy "admin delete contact_messages"
  on public.contact_messages for delete
  using ((auth.jwt() ->> 'email') = 'ajayipelumi50@gmail.com');

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- ============================================================
-- NOTE: run ALL sections above (site_data + page_views + contact_messages).
-- Then continue with the original setup steps:
--
-- 6. Create your admin login:
-- 6. Create your admin login:
--    Dashboard -> Authentication -> Users -> Add user
--    Email:  the SAME email you put in the policy (e.g. admin@haritech.com)
--    Password: choose a strong password
--
-- 7. Copy your project URL + anon key into the .env file
--    (Project Settings -> API -> Project URL / anon public key)
--
-- 8. Rebuild & deploy. Done — admin saves now sync to all visitors.
-- ============================================================
