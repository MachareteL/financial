-- ------------------------------------------------------------------
-- Debug completo e correção das políticas RLS
-- ------------------------------------------------------------------

-- 1. Verificar se RLS está realmente desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('families', 'profiles', 'categories', 'expenses');

-- 2. Forçar desabilitação de RLS em todas as tabelas
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Families: insert" ON public.families;
DROP POLICY IF EXISTS "Families: select" ON public.families;
DROP POLICY IF EXISTS "Families: update" ON public.families;
DROP POLICY IF EXISTS "Families: all operations" ON public.families;

DROP POLICY IF EXISTS "Profiles: select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: delete" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self" ON public.profiles;

DROP POLICY IF EXISTS "Categories: select" ON public.categories;
DROP POLICY IF EXISTS "Categories: insert" ON public.categories;
DROP POLICY IF EXISTS "Categories: update" ON public.categories;
DROP POLICY IF EXISTS "Categories: delete" ON public.categories;
DROP POLICY IF EXISTS "Categories: all operations" ON public.categories;

DROP POLICY IF EXISTS "Expenses: select" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: insert" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: update" ON public.expenses;
DROP POLICY IF EXISTS "Expenses: delete" ON public.expenses;

-- 4. Verificar se ainda existem políticas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('families', 'profiles', 'categories', 'expenses');
