-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Create policy for receipts bucket
CREATE POLICY "Users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Users can delete their receipts" ON storage.objects
  FOR DELETE USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
