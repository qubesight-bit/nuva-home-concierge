-- 1. Remove client-side booking creation: the browser can no longer choose the price.
DROP POLICY IF EXISTS bookings_insert_client ON public.bookings;
REVOKE INSERT ON public.bookings FROM authenticated;
GRANT ALL ON public.bookings TO service_role;

-- 2. Price/scope columns become immutable for everyone except trusted server code.
CREATE OR REPLACE FUNCTION public.tg_bookings_lock_pricing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS bookings_lock_pricing ON public.bookings;
CREATE TRIGGER bookings_lock_pricing
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.tg_bookings_lock_pricing();

REVOKE EXECUTE ON FUNCTION public.tg_bookings_lock_pricing() FROM anon, authenticated;