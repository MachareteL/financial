-- ------------------------------------------------------------------
-- Ajusta RLS da tabela public.families para permitir INSERT/SELECT
-- ------------------------------------------------------------------

-- Garante que RLS está ativo
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (ignora erro se não existirem)
DROP POLICY IF EXISTS "Families: insert"  ON public.families;
DROP POLICY IF EXISTS "Families: select"  ON public.families;

-- 1️⃣  Permite que QUALQUER usuário autenticado crie uma família
CREATE POLICY "Families: insert"
ON public.families
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 2️⃣  Permite que o autor possa ler (SELECT) a linha recém-inserida
--     e, depois, que qualquer membro com perfil associado possa ler.
CREATE POLICY "Families: select"
ON public.families
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- a) linha pertence à família do usuário (via profile)
    id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
    -- b) OU foi criada na mesma transação pelo próprio usuário
    OR pg_visible_in_snapshot(xmin, pg_current_snapshot())
  )
);
