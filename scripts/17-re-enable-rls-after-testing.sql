-- ------------------------------------------------------------------
-- Para reabilitar RLS depois que o cadastro estiver funcionando
-- Execute este script APENAS depois de confirmar que o cadastro funciona
-- ------------------------------------------------------------------

-- Reabilita RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas simples e funcionais
CREATE POLICY "Families: all operations"
  ON public.families
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Categories: all operations"
  ON public.categories
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
