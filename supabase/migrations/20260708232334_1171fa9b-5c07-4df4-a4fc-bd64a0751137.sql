
-- Helper: provider owner is verified (ID approved) and profile approved
CREATE OR REPLACE FUNCTION public.is_provider_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _user_id AND p.verification_status = 'approved'
  ) AND EXISTS (
    SELECT 1 FROM public.id_verifications v
    WHERE v.user_id = _user_id AND v.status = 'approved'
  );
$$;

-- Tighten booking INSERT: provider must be verified, active, and published
DROP POLICY IF EXISTS bookings_insert_client ON public.bookings;
CREATE POLICY bookings_insert_client ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_user_id
  AND EXISTS (
    SELECT 1 FROM public.providers pr
    WHERE pr.id = bookings.provider_id
      AND pr.is_active
      AND pr.is_published
      AND public.is_provider_verified(pr.user_id)
  )
);

-- Allow verified providers to update their own bookings (accept/complete/cancel)
DROP POLICY IF EXISTS bookings_update_provider ON public.bookings;
CREATE POLICY bookings_update_provider ON public.bookings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.providers pr
    WHERE pr.id = bookings.provider_id
      AND pr.user_id = auth.uid()
      AND public.is_provider_verified(pr.user_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.providers pr
    WHERE pr.id = bookings.provider_id
      AND pr.user_id = auth.uid()
      AND public.is_provider_verified(pr.user_id)
  )
);
