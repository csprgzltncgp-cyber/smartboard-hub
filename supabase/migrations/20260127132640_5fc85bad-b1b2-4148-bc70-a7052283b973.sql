-- Create storage bucket for expert documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expert-documents', 'expert-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for expert documents bucket
CREATE POLICY "Authenticated users can upload expert documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'expert-documents');

CREATE POLICY "Authenticated users can view expert documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'expert-documents');

CREATE POLICY "Authenticated users can delete expert documents" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'expert-documents');