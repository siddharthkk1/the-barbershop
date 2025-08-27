-- Enable RLS on collective_rankings and add a safe SELECT policy
-- This keeps current functionality (public read) but ensures the table is protected by RLS

-- 1) Enable RLS on collective_rankings table
ALTER TABLE public.collective_rankings ENABLE ROW LEVEL SECURITY;

-- 2) Create SELECT policy allowing read-only access for everyone
CREATE POLICY "Collective rankings are viewable by everyone"
  ON public.collective_rankings
  FOR SELECT
  USING (true);