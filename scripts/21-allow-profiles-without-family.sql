-- ------------------------------------------------------------------
-- Permite que profiles existam sem family_id (para onboarding)
-- ------------------------------------------------------------------

-- Alterar a coluna family_id para permitir NULL
ALTER TABLE public.profiles ALTER COLUMN family_id DROP NOT NULL;

-- Atualizar política de profiles para permitir usuários sem família
DROP POLICY IF EXISTS "Profiles: select" ON public.profiles;

CREATE POLICY "Profiles: select"
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR (family_id IS NOT NULL AND family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid()))
  );
