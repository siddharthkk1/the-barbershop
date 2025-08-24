
-- Create NBA players table
CREATE TABLE public.nba_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT,
  position TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user rankings table to store individual user votes
CREATE TABLE public.user_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.nba_players(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL CHECK (rank_position >= 1 AND rank_position <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, player_id),
  UNIQUE(user_id, rank_position)
);

-- Create collective rankings view that calculates average rankings
CREATE OR REPLACE VIEW public.collective_rankings AS
SELECT 
  p.id,
  p.name,
  p.team,
  p.position,
  p.image_url,
  ROUND(AVG(ur.rank_position::numeric), 2) as avg_rank,
  COUNT(ur.user_id) as vote_count,
  ROW_NUMBER() OVER (ORDER BY AVG(ur.rank_position::numeric) ASC) as collective_rank
FROM public.nba_players p
LEFT JOIN public.user_rankings ur ON p.id = ur.player_id
GROUP BY p.id, p.name, p.team, p.position, p.image_url
HAVING COUNT(ur.user_id) > 0
ORDER BY avg_rank ASC
LIMIT 10;

-- Enable RLS on tables
ALTER TABLE public.nba_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nba_players (public read access)
CREATE POLICY "Anyone can view NBA players" 
  ON public.nba_players 
  FOR SELECT 
  USING (true);

-- RLS Policies for user_rankings
CREATE POLICY "Users can view all rankings" 
  ON public.user_rankings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own rankings" 
  ON public.user_rankings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings" 
  ON public.user_rankings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings" 
  ON public.user_rankings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert some sample NBA players
INSERT INTO public.nba_players (name, team, position, image_url) VALUES
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
('Shai Gilgeous-Alexander', 'Oklahoma City Thunder', 'PG', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=400&fit=crop&crop=face');
