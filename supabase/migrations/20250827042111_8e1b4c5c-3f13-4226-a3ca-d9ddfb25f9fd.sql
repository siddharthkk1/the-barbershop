-- Make RPC safe per linter: use SECURITY INVOKER (default) since caller has SELECT on the view
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

-- Ensure execute privilege remains granted
GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;