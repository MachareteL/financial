-- Fix RLS policies for incomes table
DROP POLICY IF EXISTS "Users can view family incomes" ON incomes;
DROP POLICY IF EXISTS "Users can insert family incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update family incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete family incomes" ON incomes;

-- Create proper RLS policies for incomes
CREATE POLICY "Users can view family incomes" ON incomes
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family incomes" ON incomes
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update family incomes" ON incomes
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family incomes" ON incomes
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
