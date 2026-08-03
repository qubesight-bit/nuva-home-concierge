CREATE TABLE public.didit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL UNIQUE,
  workflow_id text NOT NULL,
  status text NOT NULL DEFAULT 'Not Started',
  decision jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.didit_sessions TO authenticated;
GRANT ALL ON public.didit_sessions TO service_role;
ALTER TABLE public.didit_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY didit_sessions_select_own ON public.didit_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY didit_sessions_admin_all ON public.didit_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER didit_sessions_updated_at BEFORE UPDATE ON public.didit_sessions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.didit_webhook_events (
  event_id text PRIMARY KEY,
  session_id text,
  webhook_type text,
  status text,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.didit_webhook_events TO service_role;
ALTER TABLE public.didit_webhook_events ENABLE ROW LEVEL SECURITY;