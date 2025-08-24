
BEGIN;

-- 1) Ensure NBA players exist (insert only if missing by name)
INSERT INTO public.nba_players (name, team, position, image_url)
SELECT v.name, v.team, v.position, v.image_url
FROM (VALUES
  ('LeBron James', 'Los Angeles Lakers', 'SF', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&crop=face'),
  ('Stephen Curry', 'Golden State Warriors', 'PG', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face'),
  ('Giannis Antetokounmpo', 'Milwaukee Bucks', 'PF', 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=400&fit=crop&crop=face'),
  ('Luka Dončić', 'Dallas Mavericks', 'PG', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face'),
  ('Jayson Tatum', 'Boston Celtics', 'SF', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=400&fit=crop&crop=face'),
  ('Nikola Jokić', 'Denver Nuggets', 'C', 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=400&fit=crop&crop=face'),
  ('Joel Embiid', 'Philadelphia 76ers', 'C', 'https://images.unsplash.com/photo-1578928955273-5b2bb4b3b866?w=400&h=400&fit=crop&crop=face'),
  ('Kevin Durant', 'Phoenix Suns', 'SF', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face'),
  ('Kawhi Leonard', 'LA Clippers', 'SF', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&crop=face'),
  ('Anthony Davis', 'Los Angeles Lakers', 'PF', 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=400&fit=crop&crop=face'),
  ('Damian Lillard', 'Milwaukee Bucks', 'PG', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=face'),
  ('Shai Gilgeous-Alexander', 'Oklahoma City Thunder', 'PG', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=400&fit=crop&crop=face')
) AS v(name, team, position, image_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.nba_players p WHERE p.name = v.name
);

-- 2) Define fixed seed user IDs and clear any previous seed ballots (idempotent)
DELETE FROM public.user_rankings
WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  '55555555-5555-5555-5555-555555555555'::uuid,
  '66666666-6666-6666-6666-666666666666'::uuid,
  '77777777-7777-7777-7777-777777777777'::uuid
);

-- 3) Insert 7 realistic ballots (10 ranks each)
INSERT INTO public.user_rankings (user_id, player_id, rank_position)
SELECT b.user_id::uuid, p.id, b.rank_position
FROM (
  VALUES
  -- Ballot 1
  ('11111111-1111-1111-1111-111111111111','Nikola Jokić',1),
  ('11111111-1111-1111-1111-111111111111','Luka Dončić',2),
  ('11111111-1111-1111-1111-111111111111','Shai Gilgeous-Alexander',3),
  ('11111111-1111-1111-1111-111111111111','Giannis Antetokounmpo',4),
  ('11111111-1111-1111-1111-111111111111','Jayson Tatum',5),
  ('11111111-1111-1111-1111-111111111111','Joel Embiid',6),
  ('11111111-1111-1111-1111-111111111111','Stephen Curry',7),
  ('11111111-1111-1111-1111-111111111111','LeBron James',8),
  ('11111111-1111-1111-1111-111111111111','Kevin Durant',9),
  ('11111111-1111-1111-1111-111111111111','Anthony Davis',10),

  -- Ballot 2
  ('22222222-2222-2222-2222-222222222222','Nikola Jokić',1),
  ('22222222-2222-2222-2222-222222222222','Shai Gilgeous-Alexander',2),
  ('22222222-2222-2222-2222-222222222222','Giannis Antetokounmpo',3),
  ('22222222-2222-2222-2222-222222222222','Luka Dončić',4),
  ('22222222-2222-2222-2222-222222222222','Jayson Tatum',5),
  ('22222222-2222-2222-2222-222222222222','Stephen Curry',6),
  ('22222222-2222-2222-2222-222222222222','Joel Embiid',7),
  ('22222222-2222-2222-2222-222222222222','LeBron James',8),
  ('22222222-2222-2222-2222-222222222222','Kevin Durant',9),
  ('22222222-2222-2222-2222-222222222222','Anthony Davis',10),

  -- Ballot 3
  ('33333333-3333-3333-3333-333333333333','Giannis Antetokounmpo',1),
  ('33333333-3333-3333-3333-333333333333','Nikola Jokić',2),
  ('33333333-3333-3333-3333-333333333333','Luka Dončić',3),
  ('33333333-3333-3333-3333-333333333333','Shai Gilgeous-Alexander',4),
  ('33333333-3333-3333-3333-333333333333','Jayson Tatum',5),
  ('33333333-3333-3333-3333-333333333333','Joel Embiid',6),
  ('33333333-3333-3333-3333-333333333333','Stephen Curry',7),
  ('33333333-3333-3333-3333-333333333333','Kevin Durant',8),
  ('33333333-3333-3333-3333-333333333333','LeBron James',9),
  ('33333333-3333-3333-3333-333333333333','Kawhi Leonard',10),

  -- Ballot 4
  ('44444444-4444-4444-4444-444444444444','Nikola Jokić',1),
  ('44444444-4444-4444-4444-444444444444','Giannis Antetokounmpo',2),
  ('44444444-4444-4444-4444-444444444444','Luka Dončić',3),
  ('44444444-4444-4444-4444-444444444444','Jayson Tatum',4),
  ('44444444-4444-4444-4444-444444444444','Shai Gilgeous-Alexander',5),
  ('44444444-4444-4444-4444-444444444444','Joel Embiid',6),
  ('44444444-4444-4444-4444-444444444444','LeBron James',7),
  ('44444444-4444-4444-4444-444444444444','Stephen Curry',8),
  ('44444444-4444-4444-4444-444444444444','Kevin Durant',9),
  ('44444444-4444-4444-4444-444444444444','Anthony Davis',10),

  -- Ballot 5
  ('55555555-5555-5555-5555-555555555555','Luka Dončić',1),
  ('55555555-5555-5555-5555-555555555555','Nikola Jokić',2),
  ('55555555-5555-5555-5555-555555555555','Giannis Antetokounmpo',3),
  ('55555555-5555-5555-5555-555555555555','Shai Gilgeous-Alexander',4),
  ('55555555-5555-5555-5555-555555555555','Joel Embiid',5),
  ('55555555-5555-5555-5555-555555555555','Jayson Tatum',6),
  ('55555555-5555-5555-5555-555555555555','LeBron James',7),
  ('55555555-5555-5555-5555-555555555555','Stephen Curry',8),
  ('55555555-5555-5555-5555-555555555555','Kevin Durant',9),
  ('55555555-5555-5555-5555-555555555555','Anthony Davis',10),

  -- Ballot 6
  ('66666666-6666-6666-6666-666666666666','Nikola Jokić',1),
  ('66666666-6666-6666-6666-666666666666','Giannis Antetokounmpo',2),
  ('66666666-6666-6666-6666-666666666666','Shai Gilgeous-Alexander',3),
  ('66666666-6666-6666-6666-666666666666','Luka Dončić',4),
  ('66666666-6666-6666-6666-666666666666','Joel Embiid',5),
  ('66666666-6666-6666-6666-666666666666','Jayson Tatum',6),
  ('66666666-6666-6666-6666-666666666666','Stephen Curry',7),
  ('66666666-6666-6666-6666-666666666666','Kevin Durant',8),
  ('66666666-6666-6666-6666-666666666666','LeBron James',9),
  ('66666666-6666-6666-6666-666666666666','Kawhi Leonard',10),

  -- Ballot 7
  ('77777777-7777-7777-7777-777777777777','Nikola Jokić',1),
  ('77777777-7777-7777-7777-777777777777','Luka Dončić',2),
  ('77777777-7777-7777-7777-777777777777','Giannis Antetokounmpo',3),
  ('77777777-7777-7777-7777-777777777777','Shai Gilgeous-Alexander',4),
  ('77777777-7777-7777-7777-777777777777','Jayson Tatum',5),
  ('77777777-7777-7777-7777-777777777777','Stephen Curry',6),
  ('77777777-7777-7777-7777-777777777777','Joel Embiid',7),
  ('77777777-7777-7777-7777-777777777777','LeBron James',8),
  ('77777777-7777-7777-7777-777777777777','Kevin Durant',9),
  ('77777777-7777-7777-7777-777777777777','Anthony Davis',10)
) AS b(user_id, player_name, rank_position)
JOIN public.nba_players p ON p.name = b.player_name;

COMMIT;
