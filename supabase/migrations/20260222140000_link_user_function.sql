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
