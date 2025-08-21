-- Fix RLS policies for budgets table
DROP POLICY IF EXISTS "Users can view family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete family budgets" ON budgets;

-- Create proper RLS policies for budgets
CREATE POLICY "Users can view family budgets" ON budgets
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family budgets" ON budgets
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update family budgets" ON budgets
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family budgets" ON budgets
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
