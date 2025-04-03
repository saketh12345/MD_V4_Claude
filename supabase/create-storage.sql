
-- This file is not executed automatically, but it's kept for reference
-- The SQL below creates a storage bucket for reports

-- Create a storage bucket for reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'Reports Storage', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files (adjust as needed for security)
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reports');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'reports'
  AND auth.role() = 'authenticated'
);
