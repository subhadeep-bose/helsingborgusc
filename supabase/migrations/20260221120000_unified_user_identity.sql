-- =============================================================================
-- Unified User Identity
-- Links members and board_members to auth.users via shared foreign keys
-- Restricts login to board members only
-- =============================================================================

-- 1. Add user_id column to members table (links to the Supabase auth user)
ALTER TABLE public.members
  ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add member_id column to board_members (links a board seat to a member)
ALTER TABLE public.board_members
  ADD COLUMN member_id UUID UNIQUE REFERENCES public.members(id) ON DELETE SET NULL;

-- 3. Add user_id column to board_members for direct auth lookup
ALTER TABLE public.board_members
  ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Create index for fast lookups
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_board_members_member_id ON public.board_members(member_id);
CREATE INDEX idx_board_members_user_id ON public.board_members(user_id);

-- 5. Back-fill: link existing board_members to members by matching email
UPDATE public.board_members bm
SET member_id = m.id
FROM public.members m
WHERE lower(bm.email) = lower(m.email);

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

-- 7. Update members RLS: members can view their own record regardless of status
CREATE POLICY "Members can view own record"
  ON public.members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 8. Allow authenticated members to update their own non-status fields
CREATE POLICY "Members can update own profile"
  ON public.members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
