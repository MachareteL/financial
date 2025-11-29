-- Migration: Create subscriptions table and add trial to teams
-- Description: Implements the Reverse Trial model and Agnostic Subscription schema

BEGIN;

-- 1. Add trial_ends_at to teams
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Set default trial for existing teams (optional, maybe give them 14 days from now or mark as expired)
-- For now, we leave it null for existing, meaning they might need migration or manual handling.
-- Or we can set it to NOW() + 14 days for everyone to be nice.
-- Let's set it to NULL by default, logic will handle NULL as "expired" or "needs setup" if we want, 
-- but requirements say "New Team... starts with trial". Existing teams might be treated differently.
-- Let's assume existing teams are "Grandfathered" or we just add the column. 
-- The requirement says: "Regra do PRO: (Data Atual < Data Fim do Trial) OU (Status da Assinatura == Ativo)".
-- If trial_ends_at is NULL, the first condition is False. So they need a subscription.

-- 2. Create subscriptions table (Agnostic)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    
    -- Gateway Agnostic Fields
    external_id TEXT NOT NULL, -- e.g. 'sub_12345' (Stripe Subscription ID)
    external_customer_id TEXT NOT NULL, -- e.g. 'cus_12345'
    gateway_id TEXT NOT NULL,  -- e.g. 'stripe'
    
    status TEXT NOT NULL,      -- e.g. 'active', 'past_due', 'canceled', 'trialing'
    plan_id TEXT,              -- e.g. 'price_12345' (External Plan ID)
    
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active subscription per team per gateway (optional, but good practice)
    -- We might want to allow multiple if they are different products, but for now 1 team = 1 sub usually.
    UNIQUE(team_id, gateway_id, external_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_team_id ON public.subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external_id ON public.subscriptions(external_id);

-- 3. RLS Policies for Subscriptions

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view subscriptions of their teams
CREATE POLICY "Users can view subscriptions of their teams" ON public.subscriptions
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members WHERE profile_id = auth.uid()
        )
    );

-- Only system/webhooks should update subscriptions usually, but if we want admins to manage:
-- For now, let's restrict write access to service role (webhooks) or maybe admins if needed.
-- But typically updates come from Webhooks. 
-- Let's allow admins to read. Writes might be restricted.
-- If we need to update via API (e.g. cancel), we might need policy.
-- Assuming backend uses Service Role for webhook updates.

COMMIT;
