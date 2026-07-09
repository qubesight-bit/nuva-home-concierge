-- Revoke EXECUTE from public roles on SECURITY DEFINER functions.
-- These functions are used internally (RLS policies, auth trigger) and
-- should not be directly callable by anon/authenticated via PostgREST.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_provider_verified(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- service_role retains execute (default owner privileges) for admin/edge use.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_provider_verified(uuid) TO service_role;
