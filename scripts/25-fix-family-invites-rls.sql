-- Fix RLS policies for family_invites table
DROP POLICY IF EXISTS "Users can view family invites" ON family_invites;
DROP POLICY IF EXISTS "Users can insert family invites" ON family_invites;
DROP POLICY IF EXISTS "Users can update family invites" ON family_invites;
DROP POLICY IF EXISTS "Users can delete family invites" ON family_invites;

-- Create proper RLS policies for family_invites
CREATE POLICY "Users can view family invites" ON family_invites
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) OR email = auth.email()
  );

CREATE POLICY "Users can insert family invites" ON family_invites
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update family invites" ON family_invites
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) OR email = auth.email()
  );

CREATE POLICY "Users can delete family invites" ON family_invites
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
