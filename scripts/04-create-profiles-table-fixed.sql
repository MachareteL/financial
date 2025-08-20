-- ------------------------------------------------------------------
-- Cria a tabela public.profiles + RLS
-- ------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar tabela families primeiro (se não existir)
CREATE TABLE IF NOT EXISTS public.families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscas por family_id
CREATE INDEX IF NOT EXISTS profiles_family_id_idx ON public.profiles (family_id);

-- ------------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------------
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Profiles: select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self" ON public.profiles;
DROP POLICY IF EXISTS "Families: select" ON public.families;
DROP POLICY IF EXISTS "Families: insert" ON public.families;

-- Criar políticas para profiles
CREATE POLICY "Profiles: select"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Profiles: insert self"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: update self"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Criar políticas para families
CREATE POLICY "Families: select"
  ON public.families
  FOR SELECT
  USING (
    id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Families: insert"
  ON public.families
  FOR INSERT
  WITH CHECK (true);
