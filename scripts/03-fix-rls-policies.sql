-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their family" ON families;
DROP POLICY IF EXISTS "Users can view their profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage family categories" ON categories;
DROP POLICY IF EXISTS "Users can manage family expenses" ON expenses;

-- Create better RLS policies
CREATE POLICY "Users can view their family" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert families" ON families
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view profiles in their family" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can view family categories" ON categories
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family categories" ON categories
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view family expenses" ON expenses
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family expenses" ON expenses
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update family expenses" ON expenses
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family expenses" ON expenses
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );
