ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.id_verifications ADD COLUMN IF NOT EXISTS selfie_path text;
ALTER TABLE public.id_verifications ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.id_verifications ADD COLUMN IF NOT EXISTS selfie_date date;