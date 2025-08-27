-- Fix linter issue 0010_security_definer_view by enabling security invoker on the view
-- This ensures the view enforces permissions/RLS of the querying user, not the view owner

-- Set security_invoker on public.collective_rankings view
ALTER VIEW public.collective_rankings SET (security_invoker = on);
