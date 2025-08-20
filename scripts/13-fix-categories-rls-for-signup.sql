-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela categories para permitir cadastro
-- ------------------------------------------------------------------

-- Remove políticas existentes se houver
DROP POLICY IF EXISTS "Categories: select" ON public.categories;
DROP POLICY IF EXISTS "Categories: insert" ON public.categories;
DROP POLICY IF EXISTS "Categories: update" ON public.categories;
DROP POLICY IF EXISTS "Categories: delete" ON public.categories;

-- Política para SELECT - permite ver categorias da família
CREATE POLICY "Categories: select"
  ON public.categories
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir categorias para a família
CREATE POLICY "Categories: insert"
  ON public.categories
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- Família do usuário atual
      family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
      -- OU família recém-criada (mesma transação) - para cadastro inicial
      OR EXISTS (
        SELECT 1 FROM public.families 
        WHERE id = family_id 
        AND pg_visible_in_snapshot(xmin, pg_current_snapshot())
      )
    )
  );

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
