-- ------------------------------------------------------------------
-- Corrige as políticas RLS da tabela family_invites
-- ------------------------------------------------------------------

-- Verificar se a tabela existe e tem RLS habilitado
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Family invites: select" ON public.family_invites;
DROP POLICY IF EXISTS "Family invites: insert" ON public.family_invites;
DROP POLICY IF EXISTS "Family invites: update" ON public.family_invites;
DROP POLICY IF EXISTS "Family invites: delete" ON public.family_invites;

-- Política para SELECT - permite ver convites da família
CREATE POLICY "Family invites: select"
  ON public.family_invites
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para INSERT - permite inserir convites para a família
CREATE POLICY "Family invites: insert"
  ON public.family_invites
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
    AND invited_by = auth.uid()
  );

-- Política para UPDATE - permite atualizar convites da família
CREATE POLICY "Family invites: update"
  ON public.family_invites
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

-- Política para DELETE - permite deletar convites da família
CREATE POLICY "Family invites: delete"
  ON public.family_invites
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
