-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela profiles para permitir cadastro
-- ------------------------------------------------------------------

-- Remove políticas existentes
DROP POLICY IF EXISTS "Profiles: select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;

-- Política para SELECT - permite ver próprio perfil e perfis da mesma família
CREATE POLICY "Profiles: select"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir próprio perfil
CREATE POLICY "Profiles: insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Política para UPDATE - permite atualizar próprio perfil
CREATE POLICY "Profiles: update"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Política para DELETE - permite deletar próprio perfil (opcional)
CREATE POLICY "Profiles: delete"
  ON public.profiles
  FOR DELETE
  USING (id = auth.uid());
