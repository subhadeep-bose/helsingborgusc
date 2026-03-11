-- Fix 1: Harden link_user_to_member to validate email match and approved status
CREATE OR REPLACE FUNCTION public.link_user_to_member(_member_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  member_email TEXT;
  user_email TEXT;
BEGIN
  -- Get the member's email
  SELECT email INTO member_email FROM public.members WHERE id = _member_id;

  -- Get the calling user's email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  -- Only link if emails match (case-insensitive), user_id is NULL, and member is approved
  UPDATE public.members
  SET user_id = auth.uid()
  WHERE id = _member_id
    AND user_id IS NULL
    AND LOWER(email) = LOWER(user_email)
    AND status = 'approved';

  -- Also link board_member if exists
  UPDATE public.board_members
  SET user_id = auth.uid()
  WHERE member_id = _member_id
    AND user_id IS NULL;
END;
$$;

-- Fix 2: Create a public view for members that only exposes safe columns
-- Then update the RLS policy to remove public access to the raw members table

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Approved members are publicly viewable" ON public.members;

-- Create a new policy that only allows admins and the member themselves to SELECT
-- (authenticated users can already see their own record via "Members can view own record")
CREATE POLICY "Admins can view all members"
ON public.members
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a public view exposing only safe fields for the public members page
CREATE OR REPLACE VIEW public.members_public AS
SELECT id, first_name, last_name, experience_level, registered_at
FROM public.members
WHERE status = 'approved';

-- Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.members_public TO anon, authenticated;