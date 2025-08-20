-- ------------------------------------------------------------------
-- Recriar tabelas se necessário (último recurso)
-- ------------------------------------------------------------------

-- ATENÇÃO: Este script apaga e recria as tabelas
-- Use apenas se os outros scripts não funcionarem

-- Backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS backup_families AS SELECT * FROM public.families;
CREATE TABLE IF NOT EXISTS backup_profiles AS SELECT * FROM public.profiles;
CREATE TABLE IF NOT EXISTS backup_categories AS SELECT * FROM public.categories;
CREATE TABLE IF NOT EXISTS backup_expenses AS SELECT * FROM public.expenses;

-- Dropar tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;

-- Recriar tabelas sem RLS
CREATE TABLE public.families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('necessidades', 'desejos', 'poupanca')),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX profiles_family_id_idx ON public.profiles (family_id);
CREATE INDEX categories_family_id_idx ON public.categories (family_id);
CREATE INDEX expenses_family_id_idx ON public.expenses (family_id);
CREATE INDEX expenses_date_idx ON public.expenses (date);
CREATE INDEX expenses_category_id_idx ON public.expenses (category_id);

-- RLS desabilitado por padrão (não executar ALTER TABLE ... ENABLE ROW LEVEL SECURITY)
