
-- Phase 1: Restrict user_rankings visibility to the owner only

-- Drop broad public SELECT policy if present
DROP POLICY IF EXISTS "Users can view all rankings" ON public.user_rankings;

-- Create restrictive SELECT policy (users only see their own rows)
CREATE POLICY "Users can view their own rankings"
ON public.user_rankings
FOR SELECT
USING (auth.uid() = user_id);

-- Existing INSERT/UPDATE/DELETE policies remain unchanged


-- Phase 2: Protect collective_rankings from direct reads/writes, expose via RPC

-- Ensure RLS is enabled on collective_rankings
ALTER TABLE public.collective_rankings ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies (defensive; none may exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'collective_rankings'
  ) THEN
    EXECUTE (
      SELECT string_agg(format('DROP POLICY IF EXISTS %I ON public.collective_rankings;', polname), E'\n')
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'collective_rankings'
    );
  END IF;
END $$;

-- Do NOT add SELECT/INSERT/UPDATE/DELETE policies => clients cannot access the table directly

-- Additionally, revoke direct privileges from anon/authenticated (belt-and-suspenders)
REVOKE ALL ON TABLE public.collective_rankings FROM anon, authenticated;

-- Create a SECURITY DEFINER function to safely expose the public collective rankings
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
STABLE
SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT
    id,
    avg_rank,
    vote_count,
    collective_rank,
    name,
    team,
    "position" as position,
    image_url
  FROM public.collective_rankings
  ORDER BY collective_rank ASC NULLS LAST
$func$;

COMMENT ON FUNCTION public.get_collective_rankings IS
'Public, read-only access to aggregated Top 10 rankings. Runs with elevated privileges and does not expose per-user data.';

-- Allow both anonymous and authenticated clients to call the RPC
GRANT EXECUTE ON FUNCTION public.get_collective_rankings() TO anon, authenticated;
