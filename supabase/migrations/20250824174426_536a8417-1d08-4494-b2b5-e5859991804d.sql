-- Fix: Set view to SECURITY INVOKER to avoid bypassing RLS via view owner privileges
-- This keeps existing functionality since underlying tables allow SELECT for all users

-- Ensure the view exists before altering (Postgres supports IF EXISTS for ALTER VIEW)
ALTER VIEW IF EXISTS public.collective_rankings SET (security_invoker = true);

-- Optional: document the intent
COMMENT ON VIEW public.collective_rankings IS 'Aggregated top-10 rankings. SECURITY INVOKER set to ensure RLS of querying user applies.';