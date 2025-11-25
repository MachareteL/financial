-- scripts/43-allow-public-profile-insert.sql

BEGIN;

-- 1. Remove a política anterior que exigia auth.uid()
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert" ON public.profiles;

-- 2. Cria uma política que permite INSERT para qualquer um (inclusive anon)
-- A segurança fica por conta da Foreign Key (só insere se o ID do user existir)
CREATE POLICY "Allow profile creation during signup"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);

COMMIT;