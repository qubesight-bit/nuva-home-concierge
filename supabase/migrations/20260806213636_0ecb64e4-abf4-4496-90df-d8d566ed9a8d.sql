CREATE TABLE public.verification_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid REFERENCES public.id_verifications(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approved','rejected')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.verification_audit_log TO authenticated;
GRANT ALL ON public.verification_audit_log TO service_role;

ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_admin" ON public.verification_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_select_own" ON public.verification_audit_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "audit_insert_admin" ON public.verification_audit_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX verification_audit_log_user_id_idx ON public.verification_audit_log(user_id, created_at DESC);