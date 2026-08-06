CREATE OR REPLACE FUNCTION public.is_profile_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.verification_status = 'approved'
  );
$$;

REVOKE ALL ON FUNCTION public.is_profile_approved(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_profile_approved(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "providers_select_public" ON public.providers;
CREATE POLICY "providers_select_public"
ON public.providers FOR SELECT TO anon, authenticated
USING (is_active AND is_published AND public.is_profile_approved(user_id));
