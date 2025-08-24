
BEGIN;

-- Replace the existing table (if any) with a view that always reflects latest votes
DROP VIEW IF EXISTS public.collective_rankings;
DROP TABLE IF EXISTS public.collective_rankings;

CREATE VIEW public.collective_rankings AS
WITH agg AS (
  SELECT
    p.id AS player_id,
    p.name,
    p.team,
    p.position,
    p.image_url,
    AVG(ur.rank_position)::numeric AS avg_rank,
    COUNT(*)::bigint AS vote_count
  FROM public.user_rankings ur
  JOIN public.nba_players p ON p.id = ur.player_id
  GROUP BY p.id, p.name, p.team, p.position, p.image_url
),
ranked AS (
  SELECT
    NULL::uuid AS id,
    name,
    team,
    position,
    image_url,
    avg_rank,
    vote_count,
    DENSE_RANK() OVER (ORDER BY avg_rank ASC)::bigint AS collective_rank
  FROM agg
)
SELECT *
FROM ranked
ORDER BY collective_rank, avg_rank, name
LIMIT 10;

COMMIT;
