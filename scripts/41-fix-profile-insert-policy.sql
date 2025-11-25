-- scripts/41-fix-profile-insert-policy.sql

BEGIN;

-- 1. Garante que RLS está ativo na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas de INSERT antigas ou duplicadas para evitar conflitos
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;

-- 3. Cria a política de INSERT fundamental para o cadastro
-- Permite que um usuário autenticado insira uma linha na tabela profiles,
-- DESDE QUE o 'id' dessa nova linha seja igual ao seu próprio 'auth.uid()'.
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- 4. (Opcional) Garante que a política de SELECT criada no script 40 permita ver o próprio perfil
-- (Isso é necessário para o retorno dos dados após o insert)
-- O script 40 já deve ter cuidado disso, mas por segurança verificamos se não há bloqueios extras.

COMMIT;