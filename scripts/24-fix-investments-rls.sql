-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela investments
-- ------------------------------------------------------------------

-- Verificar se a tabela existe e tem RLS habilitado
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Investments: select" ON public.investments;
DROP POLICY IF EXISTS "Investments: insert" ON public.investments;
DROP POLICY IF EXISTS "Investments: update" ON public.investments;
DROP POLICY IF EXISTS "Investments: delete" ON public.investments;

-- Política para SELECT - permite ver investimentos da família
CREATE POLICY "Investments: select"
  ON public.investments
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir investimentos para a família
CREATE POLICY "Investments: insert"
  ON public.investments
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para UPDATE - permite atualizar investimentos da família
CREATE POLICY "Investments: update"
  ON public.investments
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para DELETE - permite deletar investimentos da família
CREATE POLICY "Investments: delete"
  ON public.investments
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
