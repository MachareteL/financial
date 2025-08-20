-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela families para permitir cadastro
-- Versão compatível com Supabase (sem pg_visible_in_snapshot)
-- ------------------------------------------------------------------

-- Remove políticas existentes
DROP POLICY IF EXISTS "Families: insert" ON public.families;
DROP POLICY IF EXISTS "Families: select" ON public.families;
DROP POLICY IF EXISTS "Families: update" ON public.families;

-- Política para INSERT - permite que qualquer usuário autenticado crie uma família
CREATE POLICY "Families: insert"
  ON public.families
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para SELECT - permite ver famílias onde o usuário é membro
-- Versão simplificada que funciona no Supabase
CREATE POLICY "Families: select"
  ON public.families
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para UPDATE - permite atualizar família onde é membro
CREATE POLICY "Families: update"
  ON public.families
  FOR UPDATE
  USING (
    id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
