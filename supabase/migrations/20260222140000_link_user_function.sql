-- SECURITY DEFINER function to link an auth user to their member record
-- on first login. Required because the RLS UPDATE policy on members
-- checks user_id = auth.uid(), which is NULL before the initial link.

CREATE OR REPLACE FUNCTION public.link_user_to_member(_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only link if not already linked, and only to the calling user
  UPDATE members
  SET user_id = auth.uid()
  WHERE id = _member_id
    AND user_id IS NULL;

  -- Also link board_member record if one is associated
  UPDATE board_members
  SET user_id = auth.uid()
  WHERE member_id = _member_id
    AND user_id IS NULL;
END;
$$;

-- Back-fill: retroactively link any members who already have auth accounts
-- but whose user_id was never set (because the function didn't exist yet)
UPDATE public.members m
SET user_id = u.id
FROM auth.users u
WHERE lower(m.email) = lower(u.email)
  AND m.user_id IS NULL;

-- Also back-fill board_members user_id for any linked members
UPDATE public.board_members bm
SET user_id = m.user_id
FROM public.members m
WHERE bm.member_id = m.id
  AND m.user_id IS NOT NULL
  AND bm.user_id IS NULL;
