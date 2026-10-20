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
-- After running the SQL above:
--
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
