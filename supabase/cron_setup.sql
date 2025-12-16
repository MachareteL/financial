-- 1. Habilitar extensões necessárias (execute no SQL Editor do Supabase)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Agendar o Job (Exemplo: Toda segunda-feira às 09:00 AM)
-- IMPORTANTE: Substitua 'SEU_APP_URL' pela URL de produção da sua aplicação (ex: https://seu-app.vercel.app)
-- IMPORTANTE: Substitua 'SEU_CRON_SECRET' pelo valor definido na variável de ambiente CRON_SECRET

select
  cron.schedule(
    'generate-weekly-reports', -- Nome único do job
    '0 9 * * 1',              -- Sintaxe Cron (Minuto 0, Hora 9, Todo dia, Todo mês, Segunda-feira)
    $$
    select
      net.http_get(
          url:='SEU_APP_URL/api/cron/weekly-report',
          headers:='{"Authorization": "Bearer SEU_CRON_SECRET"}'::jsonb
      ) as request_id;
    $$
  );

-- Comandos úteis:

-- Listar jobs agendados:
-- select * from cron.job;

-- Remover o agendamento:
-- select cron.unschedule('generate-weekly-reports');

-- Ver logs de execução (se disponível depende da configuração do pg_net/cron):
-- select * from cron.job_run_details order by start_time desc;
