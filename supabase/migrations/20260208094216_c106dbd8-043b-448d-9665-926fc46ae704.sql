
-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  experience_level TEXT,
  message TEXT,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Anyone can register (insert)
CREATE POLICY "Anyone can register as a member"
ON public.members
FOR INSERT
WITH CHECK (true);

-- Anyone can view members (public list)
CREATE POLICY "Members are publicly viewable"
ON public.members
FOR SELECT
USING (true);
