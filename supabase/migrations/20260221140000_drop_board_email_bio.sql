-- Remove email and bio columns from board_members
-- These fields are not needed; board contact info lives in the linked member record.

ALTER TABLE public.board_members DROP COLUMN IF EXISTS email;
ALTER TABLE public.board_members DROP COLUMN IF EXISTS bio;
