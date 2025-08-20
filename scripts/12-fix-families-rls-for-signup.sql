-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela families para permitir cadastro
-- ------------------------------------------------------------------

-- Remove políticas existentes
DROP POLICY IF EXISTS "Families: insert" ON public.families;
DROP POLICY IF EXISTS "Families: select" ON public.families;

-- Política para INSERT - permite que qualquer usuário autenticado crie uma família
CREATE POLICY "Families: insert"
  ON public.families
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para SELECT - permite ver famílias onde o usuário é membro
CREATE POLICY "Families: select"
  ON public.families
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      -- Família do usuário atual
      id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
      -- OU família recém-criada (mesma transação)
      OR pg_visible_in_snapshot(xmin, pg_current_snapshot())
    )
  );

-- Política para UPDATE - permite atualizar família onde é membro
CREATE POLICY "Families: update"
  ON public.families
  FOR UPDATE
  USING (
    id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
