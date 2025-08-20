-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('necessidades', 'desejos', 'poupanca')),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their family" ON families
  FOR SELECT USING (id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their profile" ON profiles
  FOR ALL USING (id = auth.uid() OR family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage family categories" ON categories
  FOR ALL USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage family expenses" ON expenses
  FOR ALL USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- Insert default categories
INSERT INTO categories (name, classification, family_id) 
SELECT 'Moradia', 'necessidades', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Transporte', 'necessidades', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Alimentação', 'necessidades', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Lazer', 'desejos', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Saúde', 'necessidades', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Investimentos', 'poupanca', id FROM families;

INSERT INTO categories (name, classification, family_id) 
SELECT 'Outros', 'necessidades', id FROM families;
