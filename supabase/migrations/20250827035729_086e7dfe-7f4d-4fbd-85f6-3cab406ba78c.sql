-- Enable RLS on collective_rankings and add a safe SELECT policy
-- This keeps current functionality (public read) but ensures the table is protected by RLS

-- 1) Enable RLS
alter table if exists public.collective_rankings enable row level security;

-- 2) Create SELECT policy allowing read-only access for everyone
-- If the table already has a similar policy, this will create a new one with a distinct name
create policy if not exists "Collective rankings are viewable by everyone"
  on public.collective_rankings
  for select
  using (true);
