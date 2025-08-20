-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela budgets
-- ------------------------------------------------------------------

-- Verificar se a tabela existe e tem RLS habilitado
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Budgets: select" ON public.budgets;
DROP POLICY IF EXISTS "Budgets: insert" ON public.budgets;
DROP POLICY IF EXISTS "Budgets: update" ON public.budgets;
DROP POLICY IF EXISTS "Budgets: delete" ON public.budgets;

-- Política para SELECT - permite ver orçamentos da família
CREATE POLICY "Budgets: select"
  ON public.budgets
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir orçamentos para a família
CREATE POLICY "Budgets: insert"
  ON public.budgets
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para UPDATE - permite atualizar orçamentos da família
CREATE POLICY "Budgets: update"
  ON public.budgets
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para DELETE - permite deletar orçamentos da família
CREATE POLICY "Budgets: delete"
  ON public.budgets
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
