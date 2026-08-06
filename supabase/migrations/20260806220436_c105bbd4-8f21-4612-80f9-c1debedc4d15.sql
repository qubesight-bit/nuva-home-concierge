-- Strip the blanket arwdDxtm grants that let the public API key reach every table.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Public marketplace listings only (still filtered by providers_select_public).
GRANT SELECT ON public.providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;

-- Own profile (read + limited update; admins covered by their policies).
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Bookings: no client INSERT — creation is server-only via createBooking.
GRANT SELECT, UPDATE ON public.bookings TO authenticated;

-- Identity verification submissions and their review.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.id_verifications TO authenticated;

-- Roles: read own; admin management is policy-gated.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Didit sessions: read own only; writes come from the server.
GRANT SELECT ON public.didit_sessions TO authenticated;

-- Audit log: append-only for admins, readable per policy.
GRANT SELECT, INSERT ON public.verification_audit_log TO authenticated;

-- Webhook idempotency log stays server-only (no anon/authenticated grants).
GRANT ALL ON public.bookings, public.profiles, public.providers, public.id_verifications,
              public.user_roles, public.didit_sessions, public.didit_webhook_events,
              public.verification_audit_log
  TO service_role;

-- New tables must not inherit wide-open grants again.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
