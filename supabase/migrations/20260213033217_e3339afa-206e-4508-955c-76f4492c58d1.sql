
-- Add status column to members table
ALTER TABLE public.members ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Update existing members to approved
UPDATE public.members SET status = 'approved';

-- Update the public SELECT policy to only show approved members
DROP POLICY "Members are publicly viewable" ON public.members;
CREATE POLICY "Approved members are publicly viewable" ON public.members FOR SELECT USING (status = 'approved' OR has_role(auth.uid(), 'admin'));
