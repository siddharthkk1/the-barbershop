-- Check for any remaining security definer views and fix them
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%security%definer%';

-- Also check all views in public schema
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public';