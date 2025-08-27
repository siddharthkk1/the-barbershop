-- Tighten RLS: restrict SELECT on user_rankings to only the row owner
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive SELECT policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_rankings' 
      AND policyname = 'Users can view all rankings'
  ) THEN
    DROP POLICY "Users can view all rankings" ON public.user_rankings;
  END IF;
END $$;

-- Create restrictive SELECT policy
CREATE POLICY "Users can view their own rankings"
ON public.user_rankings
FOR SELECT
USING (auth.uid() = user_id);

-- Keep existing insert/update/delete policies as-is (already scoped to auth.uid())

-- Ensure collective rankings remain publicly available but anonymized via a SECURITY DEFINER function
-- Recreate function as SECURITY DEFINER so it can aggregate across all rows while returning only aggregated fields
CREATE OR REPLACE FUNCTION public.get_collective_rankings()
RETURNS TABLE(
  id uuid,
  avg_rank numeric,
  vote_count bigint,
  collective_rank bigint,
  name text,
  team text,
  "position" text,
  image_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cr.id,
    cr.avg_rank,
    cr.vote_count,
    cr.collective_rank,
    cr.name,
    cr.team,
    cr.position,
    cr.image_url
  FROM public.collective_rankings cr
  ORDER BY cr.collective_rank
  LIMIT 10;
$$;

-- Grant execute on the RPC to both anon and authenticated so clients can call it
GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;