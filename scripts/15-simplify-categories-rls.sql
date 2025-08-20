-- ------------------------------------------------------------------
-- Simplifica RLS da tabela categories para funcionar com cadastro
-- ------------------------------------------------------------------

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Categories: select" ON public.categories;
DROP POLICY IF EXISTS "Categories: insert" ON public.categories;
DROP POLICY IF EXISTS "Categories: update" ON public.categories;
DROP POLICY IF EXISTS "Categories: delete" ON public.categories;

-- Política para SELECT - permite ver categorias da família do usuário
CREATE POLICY "Categories: select"
  ON public.categories
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
      OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Política para INSERT - permite inserir categorias
CREATE POLICY "Categories: insert"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE - permite atualizar categorias da família
CREATE POLICY "Categories: update"
  ON public.categories
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para DELETE - permite deletar categorias da família
CREATE POLICY "Categories: delete"
  ON public.categories
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
