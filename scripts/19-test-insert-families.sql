-- ------------------------------------------------------------------
-- Teste direto de inserção na tabela families
-- ------------------------------------------------------------------

-- Testar inserção direta (deve funcionar se RLS estiver desabilitado)
INSERT INTO public.families (id, name) 
VALUES (gen_random_uuid(), 'Teste Família') 
ON CONFLICT DO NOTHING;

-- Verificar se a inserção funcionou
SELECT COUNT(*) as total_families FROM public.families;

-- Limpar teste
DELETE FROM public.families WHERE name = 'Teste Família';
