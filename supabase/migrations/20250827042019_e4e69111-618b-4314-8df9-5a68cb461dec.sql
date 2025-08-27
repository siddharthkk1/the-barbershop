-- Harden collective rankings: ensure it's a read-only view with controlled access

-- 1) Drop existing table/view if present, then recreate as a view
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'collective_rankings'
  ) THEN
    DROP TABLE public.collective_rankings;
  ELSIF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'collective_rankings'
  ) THEN
    DROP VIEW public.collective_rankings;
  END IF;
END
$$;

-- 2) Create the view from aggregated user_rankings + nba_players
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

-- 3) Lock down privileges: read-only access for anon/authenticated, nothing else
REVOKE ALL ON TABLE public.collective_rankings FROM PUBLIC;
GRANT SELECT ON TABLE public.collective_rankings TO anon, authenticated;

-- 4) Create a stable, security-definer RPC used by the frontend
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
SECURITY DEFINER
SET search_path = public, pg_temp
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

GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;