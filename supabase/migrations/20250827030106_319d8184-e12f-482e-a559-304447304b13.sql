
-- Create the get_collective_rankings function
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
AS $$
  SELECT 
    p.id,
    AVG(ur.rank_position::numeric) as avg_rank,
    COUNT(ur.rank_position) as vote_count,
    ROW_NUMBER() OVER (ORDER BY AVG(ur.rank_position::numeric) ASC) as collective_rank,
    p.name,
    p.team,
    p.position,
    p.image_url
  FROM nba_players p
  JOIN user_rankings ur ON p.id = ur.player_id
  GROUP BY p.id, p.name, p.team, p.position, p.image_url
  ORDER BY avg_rank ASC
  LIMIT 10;
$$;
