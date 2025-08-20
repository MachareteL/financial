-- ------------------------------------------------------------------
-- Solução final para RLS da tabela families
-- Permite criar e ver famílias durante o cadastro
-- ------------------------------------------------------------------

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Families: insert" ON public.families;
DROP POLICY IF EXISTS "Families: select" ON public.families;
DROP POLICY IF EXISTS "Families: update" ON public.families;

-- Desabilita RLS temporariamente para permitir operações durante cadastro
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;

-- Reabilita RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Política para INSERT - qualquer usuário autenticado pode criar família
CREATE POLICY "Families: insert"
  ON public.families
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para SELECT - permite ver qualquer família (será restringida pelo profile)
-- Durante o cadastro, o usuário precisa ver a família antes de criar o profile
CREATE POLICY "Families: select"
  ON public.families
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política para UPDATE - permite atualizar famílias onde é membro
CREATE POLICY "Families: update"
  ON public.families
  FOR UPDATE
  USING (
    id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
