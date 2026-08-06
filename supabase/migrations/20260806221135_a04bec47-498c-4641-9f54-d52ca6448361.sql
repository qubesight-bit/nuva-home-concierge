-- 1) id_verifications: a user must not be able to self-approve on insert.
DROP POLICY IF EXISTS id_verif_insert_own ON public.id_verifications;
CREATE POLICY id_verif_insert_own ON public.id_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'::verification_status
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND review_notes IS NULL
  );

-- 2) providers: rating / review_count / user_id are server-owned trust signals.
CREATE OR REPLACE FUNCTION public.tg_providers_lock_trust_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin')
  THEN
    IF TG_OP = 'INSERT' THEN
      NEW.rating := 5.00;
      NEW.review_count := 0;
    ELSE
      IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Listing ownership cannot be changed.';
      END IF;
      NEW.rating := OLD.rating;
      NEW.review_count := OLD.review_count;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS providers_lock_trust_fields ON public.providers;
CREATE TRIGGER providers_lock_trust_fields
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_providers_lock_trust_fields();

-- 3) profiles: email + admin review metadata are not self-editable.
CREATE OR REPLACE FUNCTION public.tg_profiles_lock_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin')
  THEN
    NEW.email := OLD.email;
    NEW.verification_status := OLD.verification_status;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.review_notes := OLD.review_notes;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS profiles_lock_admin_fields ON public.profiles;
CREATE TRIGGER profiles_lock_admin_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_profiles_lock_admin_fields();

REVOKE EXECUTE ON FUNCTION public.tg_providers_lock_trust_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_profiles_lock_admin_fields() FROM PUBLIC, anon, authenticated;