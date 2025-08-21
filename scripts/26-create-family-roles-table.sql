-- Criar tabela de cargos da família
CREATE TABLE IF NOT EXISTS family_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna role_id na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES family_roles(id) ON DELETE SET NULL;

-- Adicionar coluna role_id na tabela family_invites
ALTER TABLE family_invites 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES family_roles(id) ON DELETE SET NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_family_roles_family_id ON family_roles(family_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_role_id ON family_invites(role_id);

-- Habilitar RLS
ALTER TABLE family_roles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para family_roles
CREATE POLICY "Users can view family roles" ON family_roles
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage family roles" ON family_roles
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Inserir cargos padrão para famílias existentes
INSERT INTO family_roles (family_id, name, color, permissions, is_default)
SELECT 
  f.id,
  'Administrador',
  '#ef4444',
  ARRAY[
    'view_dashboard', 'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
    'view_budget', 'edit_budget', 'view_investments', 'edit_investments',
    'view_categories', 'edit_categories', 'manage_family', 'manage_roles'
  ],
  true
FROM families f
WHERE NOT EXISTS (
  SELECT 1 FROM family_roles fr WHERE fr.family_id = f.id AND fr.name = 'Administrador'
);

INSERT INTO family_roles (family_id, name, color, permissions, is_default)
SELECT 
  f.id,
  'Membro',
  '#22c55e',
  ARRAY[
    'view_dashboard', 'view_expenses', 'create_expenses', 'edit_expenses',
    'view_budget', 'view_investments', 'view_categories'
  ],
  true
FROM families f
WHERE NOT EXISTS (
  SELECT 1 FROM family_roles fr WHERE fr.family_id = f.id AND fr.name = 'Membro'
);

INSERT INTO family_roles (family_id, name, color, permissions, is_default)
SELECT 
  f.id,
  'Visualizador',
  '#3b82f6',
  ARRAY['view_dashboard', 'view_expenses', 'view_budget', 'view_investments'],
  true
FROM families f
WHERE NOT EXISTS (
  SELECT 1 FROM family_roles fr WHERE fr.family_id = f.id AND fr.name = 'Visualizador'
);

-- Comentários para documentação
COMMENT ON TABLE family_roles IS 'Cargos/roles da família com permissões específicas';
COMMENT ON COLUMN family_roles.permissions IS 'Array de permissões do cargo';
COMMENT ON COLUMN family_roles.is_default IS 'Indica se é um cargo padrão do sistema';
COMMENT ON COLUMN profiles.role_id IS 'Cargo do usuário na família';
COMMENT ON COLUMN family_invites.role_id IS 'Cargo que será atribuído ao aceitar o convite';
