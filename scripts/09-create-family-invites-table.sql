-- ------------------------------------------------------------------
-- Cria tabela para convites de família
-- ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.family_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS family_invites_family_id_idx ON public.family_invites (family_id);
CREATE INDEX IF NOT EXISTS family_invites_email_idx ON public.family_invites (email);
CREATE INDEX IF NOT EXISTS family_invites_status_idx ON public.family_invites (status);

-- Row Level Security
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Family invites: select"
  ON public.family_invites
  FOR SELECT
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Family invites: insert"
  ON public.family_invites
  FOR INSERT
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Family invites: update"
  ON public.family_invites
  FOR UPDATE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Family invites: delete"
  ON public.family_invites
  FOR DELETE
  USING (
    family_id IN (SELECT family_id FROM public.profiles WHERE id = auth.uid())
  );
