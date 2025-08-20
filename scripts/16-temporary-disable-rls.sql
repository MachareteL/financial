-- ------------------------------------------------------------------
-- Solução temporária: desabilita RLS durante desenvolvimento
-- ATENÇÃO: Use apenas em desenvolvimento, não em produção
-- ------------------------------------------------------------------

-- Desabilita RLS temporariamente para families e categories
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Mantém RLS apenas para profiles e expenses (mais críticos)
-- public.profiles já tem RLS funcionando
-- public.expenses já tem RLS funcionando
