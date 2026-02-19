
-- Add shots_against column so SV% can be auto-calculated
ALTER TABLE public.players ADD COLUMN shots_against integer DEFAULT NULL;
