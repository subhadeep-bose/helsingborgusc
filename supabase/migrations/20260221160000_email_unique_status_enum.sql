-- #6: Add UNIQUE constraint on members.email
-- #7: Convert members.status from text to a proper enum

-- Step 1: Remove any duplicate emails, keeping the most recent registration
DELETE FROM public.members
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM public.members
  ORDER BY email, registered_at DESC
);

-- Step 2: Add the unique constraint
ALTER TABLE public.members
  ADD CONSTRAINT members_email_unique UNIQUE (email);

-- Step 3: Create the status enum and convert the column
CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.members
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.members
  ALTER COLUMN status TYPE public.member_status
  USING status::public.member_status;

ALTER TABLE public.members
  ALTER COLUMN status SET DEFAULT 'pending'::public.member_status;

-- Step 4: Add index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
