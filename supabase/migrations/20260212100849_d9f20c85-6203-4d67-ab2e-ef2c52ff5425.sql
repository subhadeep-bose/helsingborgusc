
-- Board members table
CREATE TABLE public.board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  email text,
  bio text,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board members are publicly viewable" ON public.board_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert board members" ON public.board_members FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update board members" ON public.board_members FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete board members" ON public.board_members FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON public.board_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Schedule entries table
CREATE TABLE public.schedule_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL,
  time text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  category text NOT NULL DEFAULT 'weekly',
  event_date date,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedule entries are publicly viewable" ON public.schedule_entries FOR SELECT USING (true);
CREATE POLICY "Admins can insert schedule entries" ON public.schedule_entries FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update schedule entries" ON public.schedule_entries FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete schedule entries" ON public.schedule_entries FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_schedule_entries_updated_at BEFORE UPDATE ON public.schedule_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gallery images table
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alt text NOT NULL DEFAULT '',
  storage_path text NOT NULL,
  sort_order int DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery images are publicly viewable" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert gallery images" ON public.gallery_images FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery images" ON public.gallery_images FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery images" ON public.gallery_images FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Storage bucket for gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

CREATE POLICY "Gallery images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND has_role(auth.uid(), 'admin'));

-- Seed board members from current static data
INSERT INTO public.board_members (name, role, email, bio, sort_order) VALUES
  ('Anna Lindqvist', 'Chairperson', 'anna@helsingborgunited.se', 'Passionate about growing cricket in Sweden. Leading the club since 2020.', 1),
  ('Rajan Gupta', 'Vice Chairperson', 'rajan@helsingborgunited.se', 'Experienced cricketer with a vision for inclusive sports in Helsingborg.', 2),
  ('Eva Magnusson', 'Treasurer', 'eva@helsingborgunited.se', 'Keeping our finances in order so we can focus on what matters — cricket!', 3),
  ('David Olsson', 'Secretary', 'david@helsingborgunited.se', 'Organising events and ensuring smooth club operations.', 4),
  ('Samira Ali', 'Training Coordinator', 'samira@helsingborgunited.se', 'Planning sessions and making sure every member gets the best coaching.', 5),
  ('Marcus Ek', 'Events Manager', 'marcus@helsingborgunited.se', 'Creating memorable match days and social events for the club.', 6);

-- Seed schedule entries
INSERT INTO public.schedule_entries (day, time, type, location, category, sort_order) VALUES
  ('Saturday', '10:00 – 12:00', 'Batting Practice', 'Olympia Cricket Ground', 'weekly', 1),
  ('Saturday', '13:00 – 15:00', 'Bowling & Fielding', 'Olympia Cricket Ground', 'weekly', 2),
  ('Sunday', '09:00 – 11:00', 'Net Sessions', 'Helsingborg Sports Hall', 'weekly', 3),
  ('Sunday', '11:30 – 14:00', 'Weekend Match', 'Olympia Cricket Ground', 'weekly', 4);

INSERT INTO public.schedule_entries (day, time, type, location, category, event_date, sort_order) VALUES
  ('', '', 'Season Opening Practice', 'Olympia Cricket Ground', 'event', '2026-02-15', 1),
  ('', '', 'Friendly vs Malmö CC', 'Olympia Cricket Ground', 'event', '2026-03-01', 2),
  ('', '', 'Spring Tournament', 'Lund Cricket Club', 'event', '2026-03-15', 3),
  ('', '', 'Annual General Meeting', 'Helsingborg Community Centre', 'event', '2026-04-05', 4);
