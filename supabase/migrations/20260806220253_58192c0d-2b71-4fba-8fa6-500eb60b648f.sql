-- 1. Storage: provider photos are no longer readable by anyone with a path.
DROP POLICY IF EXISTS "provider_photos_read_all" ON storage.objects;

CREATE POLICY "provider_photos_owner_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'provider-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "provider_photos_admin_read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'provider-photos' AND public.has_role(auth.uid(), 'admin'));

-- 2. Bookings: clients may only cancel or annotate their own booking.
CREATE OR REPLACE FUNCTION public.tg_bookings_lock_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user <> 'service_role' AND (
       NEW.total_cents IS DISTINCT FROM OLD.total_cents
    OR NEW.provider_id IS DISTINCT FROM OLD.provider_id
    OR NEW.client_user_id IS DISTINCT FROM OLD.client_user_id
    OR NEW.service IS DISTINCT FROM OLD.service
    OR NEW.duration_hours IS DISTINCT FROM OLD.duration_hours
    OR NEW.extras IS DISTINCT FROM OLD.extras
  ) THEN
    RAISE EXCEPTION 'Booking price and scope are set by the server and cannot be modified.';
  END IF;

  -- The booking client is not the booking's authority: they may cancel or edit notes only.
  IF current_user <> 'service_role'
     AND auth.uid() = NEW.client_user_id
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT EXISTS (
       SELECT 1 FROM public.providers p
       WHERE p.id = NEW.provider_id AND p.user_id = auth.uid()
     )
  THEN
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled'::booking_status THEN
      RAISE EXCEPTION 'Only the housekeeper can confirm or complete a booking.';
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      RAISE EXCEPTION 'Payment status is set by the server.';
    END IF;
  END IF;

  RETURN NEW;
END; $function$;
