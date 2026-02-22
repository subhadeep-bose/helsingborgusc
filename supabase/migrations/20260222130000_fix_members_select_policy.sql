-- Hotfix: restore admin override on members SELECT policy
-- The enum migration accidentally dropped the `OR has_role(...)` clause,
-- preventing admins from seeing pending/rejected members.

DROP POLICY IF EXISTS "Approved members are publicly viewable" ON public.members;
CREATE POLICY "Approved members are publicly viewable"
  ON public.members FOR SELECT
  USING (
    status = 'approved'::public.member_status
    OR public.has_role(auth.uid(), 'admin')
  );

-- Also add missing admin DELETE policy on contact_messages
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
