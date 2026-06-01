-- Create a public bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-images');

-- Allow authenticated users to upload/update/delete images
CREATE POLICY "Auth users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');
