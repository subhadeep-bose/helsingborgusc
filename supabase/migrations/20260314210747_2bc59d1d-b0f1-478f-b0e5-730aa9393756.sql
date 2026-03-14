-- Add status to gallery_images for moderation workflow
CREATE TYPE public.gallery_image_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.gallery_images 
  ADD COLUMN status public.gallery_image_status NOT NULL DEFAULT 'approved';

-- New member uploads should default to pending; admin uploads stay approved (handled in app code)

-- Allow authenticated users to insert gallery images (member uploads)
DROP POLICY IF EXISTS "Admins can insert gallery images" ON public.gallery_images;
CREATE POLICY "Authenticated users can insert gallery images"
  ON public.gallery_images FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Allow authenticated users to upload to gallery storage bucket
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

-- Admins can still delete from storage
-- (existing delete policy remains)