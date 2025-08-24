
-- Expand the nba_players table with more comprehensive player data
ALTER TABLE public.nba_players 
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS years_pro INTEGER,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS jersey_number INTEGER,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';

-- Add some sample data to demonstrate the enhanced player database
INSERT INTO public.nba_players (name, team, position, height, weight, years_pro, college, jersey_number, image_url, stats) VALUES
('LeBron James', 'LAL', 'SF', '6''9"', 250, 21, 'None', 23, 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png', '{"ppg": 25.3, "rpg": 7.3, "apg": 7.3}'),
('Stephen Curry', 'GSW', 'PG', '6''2"', 185, 14, 'Davidson', 30, 'https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png', '{"ppg": 26.4, "rpg": 4.5, "apg": 5.1}'),
('Giannis Antetokounmpo', 'MIL', 'PF', '6''11"', 243, 10, 'None', 34, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png', '{"ppg": 30.4, "rpg": 11.5, "apg": 6.5}'),
('Luka Dončić', 'DAL', 'PG', '6''7"', 230, 6, 'None', 77, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png', '{"ppg": 32.4, "rpg": 8.6, "apg": 8.0}'),
('Jayson Tatum', 'BOS', 'SF', '6''8"', 210, 7, 'Duke', 0, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png', '{"ppg": 26.9, "rpg": 8.1, "apg": 4.9}'),
('Nikola Jokić', 'DEN', 'C', '6''11"', 284, 9, 'None', 15, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png', '{"ppg": 29.2, "rpg": 13.7, "apg": 10.7}'),
('Joel Embiid', 'PHI', 'C', '7''0"', 280, 8, 'Kansas', 21, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png', '{"ppg": 34.7, "rpg": 11.0, "apg": 5.6}'),
('Kawhi Leonard', 'LAC', 'SF', '6''7"', 225, 12, 'San Diego State', 2, 'https://cdn.nba.com/headshots/nba/latest/1040x760/202695.png', '{"ppg": 23.7, "rpg": 6.1, "apg": 3.6}'),
('Jimmy Butler', 'MIA', 'SF', '6''7"', 230, 13, 'Marquette', 22, 'https://cdn.nba.com/headshots/nba/latest/1040x760/202710.png', '{"ppg": 20.8, "rpg": 5.3, "apg": 5.0}'),
('Anthony Davis', 'LAL', 'PF', '6''10"', 253, 12, 'Kentucky', 3, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png', '{"ppg": 24.7, "rpg": 12.6, "apg": 3.5}'),
('Damian Lillard', 'MIL', 'PG', '6''2"', 195, 12, 'Weber State', 0, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png', '{"ppg": 24.3, "rpg": 4.4, "apg": 7.0}'),
('Ja Morant', 'MEM', 'PG', '6''3"', 174, 5, 'Murray State', 12, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629630.png', '{"ppg": 25.1, "rpg": 5.6, "apg": 8.1}'),
('Zion Williamson', 'NOP', 'PF', '6''6"', 284, 4, 'Duke', 1, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629627.png', '{"ppg": 26.0, "rpg": 7.0, "apg": 4.6}'),
('Trae Young', 'ATL', 'PG', '6''1"', 164, 6, 'Oklahoma', 11, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1629027.png', '{"ppg": 25.7, "rpg": 2.8, "apg": 10.8}'),
('Devin Booker', 'PHX', 'SG', '6''5"', 206, 9, 'Kentucky', 1, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png', '{"ppg": 27.1, "rpg": 4.5, "apg": 6.9}'),
('Kevin Durant', 'PHX', 'SF', '6''10"', 240, 16, 'Texas', 35, 'https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png', '{"ppg": 27.1, "rpg": 6.6, "apg": 5.0}'),
('Kyrie Irving', 'DAL', 'PG', '6''2"', 195, 13, 'Duke', 11, 'https://cdn.nba.com/headshots/nba/latest/1040x760/202681.png', '{"ppg": 25.6, "rpg": 5.0, "apg": 5.2}'),
('Paul George', 'LAC', 'SF', '6''8"', 220, 14, 'Fresno State', 13, 'https://cdn.nba.com/headshots/nba/latest/1040x760/202331.png', '{"ppg": 23.0, "rpg": 6.1, "apg": 5.2}'),
('Russell Westbrook', 'LAC', 'PG', '6''3"', 200, 15, 'UCLA', 0, 'https://cdn.nba.com/headshots/nba/latest/1040x760/201566.png', '{"ppg": 15.8, "rpg": 5.1, "apg": 7.6}'),
('Bradley Beal', 'PHX', 'SG', '6''4"', 207, 12, 'Florida', 3, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203078.png', '{"ppg": 18.2, "rpg": 4.4, "apg": 5.0}'),
('Klay Thompson', 'DAL', 'SG', '6''6"', 215, 13, 'Washington State', 11, 'https://cdn.nba.com/headshots/nba/latest/1040x760/202691.png', '{"ppg": 15.1, "rpg": 3.3, "apg": 2.3}'),
('Draymond Green', 'GSW', 'PF', '6''6"', 230, 12, 'Michigan State', 23, 'https://cdn.nba.com/headshots/nba/latest/1040x760/203110.png', '{"ppg": 8.5, "rpg": 7.2, "apg": 6.0}'),
('Chris Paul', 'GSW', 'PG', '6''0"', 175, 19, 'Wake Forest', 3, 'https://cdn.nba.com/headshots/nba/latest/1040x760/101108.png', '{"ppg": 9.2, "rpg": 3.9, "apg": 6.8}'),
('De''Aaron Fox', 'SAC', 'PG', '6''3"', 185, 7, 'Kentucky', 5, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1628368.png', '{"ppg": 26.6, "rpg": 4.6, "apg": 5.6}'),
('Domantas Sabonis', 'SAC', 'C', '6''11"', 240, 8, 'Gonzaga', 10, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1627734.png', '{"ppg": 19.1, "rpg": 13.7, "apg": 8.2}'),
('Alperen Şengün', 'HOU', 'C', '6''10"', 243, 3, 'None', 28, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630578.png', '{"ppg": 21.1, "rpg": 9.9, "apg": 5.0}'),
('Scottie Barnes', 'TOR', 'SF', '6''7"', 225, 3, 'Florida State', 4, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630567.png', '{"ppg": 19.9, "rpg": 8.2, "apg": 6.1}'),
('Franz Wagner', 'ORL', 'SF', '6''9"', 220, 3, 'Michigan', 22, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630532.png', '{"ppg": 19.7, "rpg": 5.3, "apg": 3.7}'),
('Paolo Banchero', 'ORL', 'PF', '6''10"', 250, 2, 'Duke', 5, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630596.png', '{"ppg": 22.6, "rpg": 6.9, "apg": 5.4}'),
('Victor Wembanyama', 'SAS', 'C', '7''4"', 210, 1, 'None', 1, 'https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png', '{"ppg": 21.4, "rpg": 10.6, "apg": 3.9}')
ON CONFLICT (id) DO NOTHING;

-- Add an index for better search performance
CREATE INDEX IF NOT EXISTS idx_nba_players_search ON public.nba_players USING gin(to_tsvector('english', name || ' ' || COALESCE(team, '') || ' ' || COALESCE(position, '')));
CREATE INDEX IF NOT EXISTS idx_nba_players_team ON public.nba_players(team);
CREATE INDEX IF NOT EXISTS idx_nba_players_position ON public.nba_players(position);
