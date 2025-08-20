-- ------------------------------------------------------------------
-- Cria a tabela categories + RLS
-- ------------------------------------------------------------------

-- Criar tabela categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN ('necessidades', 'desejos', 'poupanca')),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscas por family_id
CREATE INDEX IF NOT EXISTS categories_family_id_idx ON public.categories (family_id);

-- Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Categories: select" ON public.categories;
DROP POLICY IF EXISTS "Categories: insert" ON public.categories;

-- Criar políticas para categories
CREATE POLICY "Categories: select"
  ON public.categories
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Categories: insert"
  ON public.categories
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
