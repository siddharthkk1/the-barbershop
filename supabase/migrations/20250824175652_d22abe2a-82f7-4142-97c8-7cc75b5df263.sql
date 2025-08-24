
-- Remove duplicate players (keep the one with the most recent created_at)
DELETE FROM public.nba_players 
WHERE id NOT IN (
  SELECT DISTINCT ON (name, team) id
  FROM public.nba_players
  ORDER BY name, team, created_at DESC
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.nba_players 
ADD CONSTRAINT unique_player_name_team UNIQUE (name, team);
