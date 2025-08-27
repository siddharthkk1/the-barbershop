-- Fix remaining security issues related to the migration

-- Fix 1: Remove the view and recreate as a regular view (not security definer)
DROP VIEW IF EXISTS public.collective_rankings;

CREATE VIEW public.collective_rankings AS
SELECT 
  p.id,
  AVG(ur.rank_position) AS avg_rank,
  COUNT(ur.rank_position) AS vote_count,
  ROW_NUMBER() OVER (ORDER BY AVG(ur.rank_position)) AS collective_rank,
  p.name,
  p.team,
  p.position,
  p.image_url
FROM public.nba_players p
JOIN public.user_rankings ur ON ur.player_id = p.id
GROUP BY p.id, p.name, p.team, p.position, p.image_url
HAVING COUNT(ur.rank_position) > 0;

-- Fix 2: Update function with proper search path
CREATE OR REPLACE FUNCTION public.get_collective_rankings()
RETURNS TABLE (
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
SET search_path = public
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

-- Set proper permissions
REVOKE ALL ON TABLE public.collective_rankings FROM PUBLIC;
GRANT SELECT ON TABLE public.collective_rankings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;