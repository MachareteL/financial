-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela incomes
-- ------------------------------------------------------------------

-- Verificar se a tabela existe e tem RLS habilitado
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Incomes: select" ON public.incomes;
DROP POLICY IF EXISTS "Incomes: insert" ON public.incomes;
DROP POLICY IF EXISTS "Incomes: update" ON public.incomes;
DROP POLICY IF EXISTS "Incomes: delete" ON public.incomes;

-- Política para SELECT - permite ver receitas da família
CREATE POLICY "Incomes: select"
  ON public.incomes
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir receitas para a família
CREATE POLICY "Incomes: insert"
  ON public.incomes
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );

-- Política para UPDATE - permite atualizar receitas da família
CREATE POLICY "Incomes: update"
  ON public.incomes
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );

-- Política para DELETE - permite deletar receitas da família
CREATE POLICY "Incomes: delete"
  ON public.incomes
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    AND user_id = auth.uid()
  );
