
-- Allow admins to update members
CREATE POLICY "Admins can update members"
ON public.members
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete members
CREATE POLICY "Admins can delete members"
ON public.members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all user_roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
