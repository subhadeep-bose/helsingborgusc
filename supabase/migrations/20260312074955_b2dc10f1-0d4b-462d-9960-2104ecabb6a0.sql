-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_entry_id uuid NOT NULL REFERENCES public.schedule_entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_entry_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view RSVPs (to show counts)
CREATE POLICY "Authenticated users can view RSVPs"
  ON public.event_rsvps FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own RSVPs
CREATE POLICY "Users can RSVP for themselves"
  ON public.event_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can remove their own RSVPs
CREATE POLICY "Users can remove own RSVP"
  ON public.event_rsvps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can delete any RSVP
CREATE POLICY "Admins can delete any RSVP"
  ON public.event_rsvps FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));