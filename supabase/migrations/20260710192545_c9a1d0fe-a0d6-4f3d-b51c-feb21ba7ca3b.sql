
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS details_included text,
  ADD COLUMN IF NOT EXISTS details_excluded text,
  ADD COLUMN IF NOT EXISTS special_notes text,
  ADD COLUMN IF NOT EXISTS custom_extras jsonb NOT NULL DEFAULT '[]'::jsonb;
