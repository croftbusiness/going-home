-- Storage Buckets Setup for Going Home App
-- Run this in your Supabase SQL Editor after creating your main schema

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Documents bucket (for wills, IDs, insurance, deeds, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Photos bucket (for obituary photos, letter attachments, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Legacy messages bucket (for video/audio messages)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('legacy-messages', 'legacy-messages', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- These policies allow authenticated users to upload/manage their own files
-- Files are organized by user_id in the path: {user_id}/{filename}

-- Documents bucket policies
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Photos bucket policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Legacy messages bucket policies
DROP POLICY IF EXISTS "Users can upload own legacy messages" ON storage.objects;
CREATE POLICY "Users can upload own legacy messages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'legacy-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own legacy messages" ON storage.objects;
CREATE POLICY "Users can view own legacy messages"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'legacy-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own legacy messages" ON storage.objects;
CREATE POLICY "Users can delete own legacy messages"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'legacy-messages' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);


