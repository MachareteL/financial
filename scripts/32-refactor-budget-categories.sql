BEGIN; -- Inicia a transação

-- 1. Criar a nova tabela para as "pastas" do orçamento (o 50/30/20)
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.0, -- Armazena 0.50 para 50%
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(team_id, name) -- Garante que não haja nomes duplicados por time
);

-- Habilitar RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage budget categories of their teams" 
  ON public.budget_categories
  FOR ALL USING (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()))
  WITH CHECK (team_id IN (SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()));

-- 2. Criar as 3 categorias de orçamento padrão (50/30/20) PARA CADA TIME JÁ EXISTENTE
INSERT INTO public.budget_categories (team_id, name, percentage)
SELECT id, 'Necessidades', 0.50 FROM public.teams
ON CONFLICT (team_id, name) DO NOTHING;

INSERT INTO public.budget_categories (team_id, name, percentage)
SELECT id, 'Desejos', 0.30 FROM public.teams
ON CONFLICT (team_id, name) DO NOTHING;

INSERT INTO public.budget_categories (team_id, name, percentage)
SELECT id, 'Poupança', 0.20 FROM public.teams
ON CONFLICT (team_id, name) DO NOTHING;

-- 3. Modificar a tabela 'categories'
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS budget_category_id UUID;

-- 4. MIGRAÇÃO DE DADOS (A CORREÇÃO ESTÁ AQUI)
-- Esta é a forma correta de fazer o "de-para"
UPDATE public.categories c
SET budget_category_id = bc.id
FROM public.budget_categories bc
WHERE 
  c.team_id = bc.team_id -- Garante que estamos no mesmo time
  AND c.classification IS NOT NULL
  -- Faz o "de-para" da 'classification' antiga para o 'name' novo
  AND (
    (c.classification = 'necessidades' AND bc.name = 'Necessidades') OR
    (c.classification = 'desejos' AND bc.name = 'Desejos') OR
    (c.classification = 'poupanca' AND bc.name = 'Poupança')
  );

-- 4.1. Tratar categorias órfãs (caso alguma 'classification' não bata)
-- Define um padrão (Necessidades) para qualquer categoria que ainda esteja nula.
UPDATE public.categories c
SET budget_category_id = (
    SELECT id FROM public.budget_categories bc
    WHERE bc.team_id = c.team_id AND bc.name = 'Necessidades'
    LIMIT 1
)
WHERE 
  c.classification IS NOT NULL 
  AND c.budget_category_id IS NULL; -- Apenas as que não foram atualizadas no passo anterior

-- 5. Tornar a coluna 'budget_category_id' obrigatória e remover a antiga 'classification'
ALTER TABLE public.categories
  ADD CONSTRAINT categories_budget_category_id_fkey
    FOREIGN KEY (budget_category_id) 
    REFERENCES public.budget_categories(id) 
    ON DELETE SET NULL; -- Se a "pasta" for deletada, a categoria fica "sem pasta" (ou ON DELETE RESTRICT)

-- Apenas torne NOT NULL se tiver certeza que a migração foi 100%
-- (Você pode pular esta linha se quiser verificar manualmente primeiro)
ALTER TABLE public.categories
  ALTER COLUMN budget_category_id SET NOT NULL;
  
ALTER TABLE public.categories
  DROP COLUMN IF EXISTS classification;

-- 6. Limpar a tabela 'budgets' para ser apenas um snapshot de renda
-- (Esta parte estava correta)
ALTER TABLE public.budgets
  DROP COLUMN IF EXISTS necessidades_budget,
  DROP COLUMN IF EXISTS desejos_budget,
  DROP COLUMN IF EXISTS poupanca_budget;

COMMIT; -- Finaliza a transação