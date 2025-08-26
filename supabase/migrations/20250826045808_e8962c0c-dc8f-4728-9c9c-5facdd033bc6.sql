-- Restrict public SELECT on user_rankings to only the owner, while preserving public aggregate access

-- 1) Update RLS policy on user_rankings
DROP POLICY IF EXISTS "Users can view all rankings" ON public.user_rankings;

CREATE POLICY "Users can view their own rankings"
ON public.user_rankings
FOR SELECT
USING (auth.uid() = user_id);

-- 2) Create a SECURITY DEFINER function to expose collective rankings publicly
CREATE OR REPLACE FUNCTION public.get_collective_rankings()
RETURNS TABLE (
  id uuid,
  avg_rank numeric,
  vote_count bigint,
  collective_rank bigint,
  name text,
  team text,
  position text,
  image_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, avg_rank, vote_count, collective_rank, name, team, position, image_url
  FROM public.collective_rankings
  ORDER BY collective_rank ASC NULLS LAST
$$;

-- Allow both anonymous and authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;