
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS offers_topless boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_nude boolean NOT NULL DEFAULT false;
