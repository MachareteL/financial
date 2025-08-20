-- ------------------------------------------------------------------
-- Remove a policy recursiva e cria uma segura
-- ------------------------------------------------------------------

-- Ativar RLS caso ainda não esteja
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Apagar a policy que causava recursão (ignore erro se não existir)
DROP POLICY IF EXISTS "Profiles: select" ON public.profiles;

-- Permitir que cada usuário leia apenas o próprio perfil
CREATE POLICY "Profiles: select own"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());
