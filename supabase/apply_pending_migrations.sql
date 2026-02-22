-- =============================================================================
-- Combined pending migrations (20260221* + 20260222*)
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 1: Unified User Identity (20260221120000)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add user_id column to members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1b. Add place_of_birth and referral_source columns to members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS referral_source TEXT;

-- 2. Add member_id column to board_members
ALTER TABLE public.board_members
  ADD COLUMN IF NOT EXISTS member_id UUID UNIQUE REFERENCES public.members(id) ON DELETE SET NULL;

-- 3. Add user_id column to board_members
ALTER TABLE public.board_members
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_board_members_member_id ON public.board_members(member_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON public.board_members(user_id);

-- 5. Back-fill: link existing board_members to members by matching email
--    (only if email column still exists on board_members)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'board_members'
      AND column_name = 'email'
  ) THEN
    UPDATE public.board_members bm
    SET member_id = m.id
    FROM public.members m
    WHERE lower(bm.email) = lower(m.email)
      AND bm.member_id IS NULL;
  END IF;
END $$;

-- 6. Helper function: check if a user is a board member
CREATE OR REPLACE FUNCTION public.is_board_member(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.board_members
    WHERE user_id = _user_id
  )
$$;

-- 7. RLS: members can view their own record
DROP POLICY IF EXISTS "Members can view own record" ON public.members;
CREATE POLICY "Members can view own record"
  ON public.members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 8. RLS: members can update their own profile
DROP POLICY IF EXISTS "Members can update own profile" ON public.members;
CREATE POLICY "Members can update own profile"
  ON public.members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 2: Drop board_members email & bio (20260221140000)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.board_members DROP COLUMN IF EXISTS email;
ALTER TABLE public.board_members DROP COLUMN IF EXISTS bio;


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 3: Email unique + status enum (20260221160000)
-- ─────────────────────────────────────────────────────────────────────────────

-- Remove duplicate emails, keeping the most recent registration
DELETE FROM public.members
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM public.members
  ORDER BY email, registered_at DESC
);

-- Add unique constraint (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_email_unique'
  ) THEN
    ALTER TABLE public.members ADD CONSTRAINT members_email_unique UNIQUE (email);
  END IF;
END $$;

-- Drop the old RLS policy that depends on text status
DROP POLICY IF EXISTS "Approved members are publicly viewable" ON public.members;

-- Create the status enum and convert the column (only if not already an enum)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
    CREATE TYPE public.member_status AS ENUM ('pending', 'approved', 'rejected');

    ALTER TABLE public.members ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE public.members
      ALTER COLUMN status TYPE public.member_status
      USING status::public.member_status;
    ALTER TABLE public.members
      ALTER COLUMN status SET DEFAULT 'pending'::public.member_status;
  END IF;
END $$;

-- Recreate the policy using the enum type (with admin override)
CREATE POLICY "Approved members are publicly viewable"
  ON public.members FOR SELECT
  USING (status = 'approved'::public.member_status OR has_role(auth.uid(), 'admin'));

-- Index on status
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 4: Contact messages table (20260221180000)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 5: Update schedule sessions (20260221220000)
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM schedule_entries WHERE category = 'event';
DELETE FROM schedule_entries WHERE category = 'weekly';

INSERT INTO schedule_entries (day, time, type, location, category, event_date, sort_order)
VALUES ('Sunday', '15:00 – 17:00 CET', 'Training Session', 'Olympia Cricket Ground', 'weekly', NULL, 1);

INSERT INTO schedule_entries (day, time, type, location, category, event_date, sort_order) VALUES
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 8)',  'Olympia Cricket Ground', 'event', '2026-02-22', 1),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 9)',  'Olympia Cricket Ground', 'event', '2026-03-01', 2),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 10)', 'Olympia Cricket Ground', 'event', '2026-03-08', 3),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 11) — NOT BOOKED', 'Olympia Cricket Ground', 'event', '2026-03-15', 4),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 12)', 'Olympia Cricket Ground', 'event', '2026-03-22', 5),
  ('Sunday', '15:00 – 17:00 CET', 'Training Session (Week 13)', 'Olympia Cricket Ground', 'event', '2026-03-29', 6);


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 6: Add fee_paid column (20260222120000)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE members ADD COLUMN IF NOT EXISTS fee_paid boolean NOT NULL DEFAULT false;


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 7: Fix members SELECT + contact_messages DELETE (20260222130000)
-- ─────────────────────────────────────────────────────────────────────────────

-- The "Approved members" policy was already recreated with admin override above,
-- but if running this script a second time, ensure it's correct:
DROP POLICY IF EXISTS "Approved members are publicly viewable" ON public.members;
CREATE POLICY "Approved members are publicly viewable"
  ON public.members FOR SELECT
  USING (
    status = 'approved'::public.member_status
    OR public.has_role(auth.uid(), 'admin')
  );

-- Admin DELETE policy for contact_messages
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 8: SECURITY DEFINER function to link auth user (20260222140000)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.link_user_to_member(_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE members
  SET user_id = auth.uid()
  WHERE id = _member_id
    AND user_id IS NULL;

  UPDATE board_members
  SET user_id = auth.uid()
  WHERE member_id = _member_id
    AND user_id IS NULL;
END;
$$;


-- ═════════════════════════════════════════════════════════════════════════════
-- Done! All 8 pending migrations applied.
-- ═════════════════════════════════════════════════════════════════════════════
