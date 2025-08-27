-- First, let's ensure collective_rankings is properly set up as a view with RLS
-- Drop and recreate the view to ensure it's properly defined
DROP VIEW IF EXISTS public.collective_rankings;

-- Create the collective_rankings view with proper aggregation
CREATE VIEW public.collective_rankings AS
SELECT 
  p.id,
  AVG(ur.rank_position) as avg_rank,
  COUNT(ur.rank_position) as vote_count,
  ROW_NUMBER() OVER (ORDER BY AVG(ur.rank_position)) as collective_rank,
  p.name,
  p.team,
  p.position,
  p.image_url
FROM public.nba_players p
INNER JOIN public.user_rankings ur ON p.id = ur.player_id
GROUP BY p.id, p.name, p.team, p.position, p.image_url
HAVING COUNT(ur.rank_position) > 0
ORDER BY avg_rank;

-- Enable RLS on the view
ALTER VIEW public.collective_rankings SET (security_invoker = true);

-- Create RLS policy for the view (anyone can read collective rankings)
CREATE POLICY "Anyone can view collective rankings"
ON public.collective_rankings
FOR SELECT
USING (true);

-- Create the RPC function that the frontend expects
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
SECURITY DEFINER
STABLE
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