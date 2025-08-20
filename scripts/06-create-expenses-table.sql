-- ------------------------------------------------------------------
-- Cria a tabela expenses + RLS
-- ------------------------------------------------------------------

-- Criar tabela expenses
CREATE TABLE IF NOT EXISTS public.expenses (
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

-- Índices
CREATE INDEX IF NOT EXISTS expenses_family_id_idx ON public.expenses (family_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON public.expenses (date);
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON public.expenses (category_id);

-- Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Expenses: select" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: insert" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: update" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: delete" ON public.expenses;

-- Criar políticas para expenses
CREATE POLICY "Expenses: select"
  ON public.expenses
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Expenses: insert"
  ON public.expenses
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Expenses: update"
  ON public.expenses
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Expenses: delete"
  ON public.expenses
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
