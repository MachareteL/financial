-- Fix RLS policies for investments table
DROP POLICY IF EXISTS "Users can view family investments" ON investments;
DROP POLICY IF EXISTS "Users can insert family investments" ON investments;
DROP POLICY IF EXISTS "Users can update family investments" ON investments;
DROP POLICY IF EXISTS "Users can delete family investments" ON investments;

-- Create proper RLS policies for investments
CREATE POLICY "Users can view family investments" ON investments
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family investments" ON investments
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update family investments" ON investments
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family investments" ON investments
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
