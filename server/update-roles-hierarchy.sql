-- ========================================
-- ATUALIZAÇÃO: Sistema de Roles/Privilégios
-- ========================================
-- Nova hierarquia de usuários (do mais privilegiado ao menos):
-- 1. ADMIN (mantido)
-- 2. STAFF
-- 3. REFEREE (Árbitros)
-- 4. CLUB (Clubes/Times)
-- 5. ATHLETE (Atletas)
-- 6. FAN (Torcedores)
-- ========================================

-- IMPORTANTE: Esta migration NÃO altera usuários ADMIN existentes!

-- Passo 1: Atualizar constraint de role para aceitar os novos valores
-- Remove constraint antigo se existir
DO $$
BEGIN
    -- Tenta remover a constraint se ela existir
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'User' AND constraint_name LIKE '%role%'
    ) THEN
        ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_role_check";
    END IF;
END $$;

-- Adiciona nova constraint com todos os roles válidos
ALTER TABLE "User" ADD CONSTRAINT "User_role_check" 
CHECK (role IN ('ADMIN', 'STAFF', 'REFEREE', 'CLUB', 'ATHLETE', 'FAN'));

-- Passo 2: Migrar roles antigos para os novos (exceto ADMIN)
-- USER → FAN (torcedor padrão)
UPDATE "User" 
SET role = 'FAN' 
WHERE role = 'USER' OR role NOT IN ('ADMIN', 'STAFF', 'REFEREE', 'CLUB', 'ATHLETE', 'FAN');

-- ENTITY → CLUB (entidades viram clubes)
UPDATE "User" 
SET role = 'CLUB' 
WHERE role = 'ENTITY';

-- Passo 3: Verificar resultados
SELECT role, COUNT(*) as total 
FROM "User" 
GROUP BY role 
ORDER BY 
    CASE role
        WHEN 'ADMIN' THEN 1
        WHEN 'STAFF' THEN 2
        WHEN 'REFEREE' THEN 3
        WHEN 'CLUB' THEN 4
        WHEN 'ATHLETE' THEN 5
        WHEN 'FAN' THEN 6
        ELSE 99
    END;

-- Comentários sobre os roles:
COMMENT ON COLUMN "User".role IS 
'Hierarquia de privilégios:
ADMIN (100) - Administrador do sistema
STAFF (80) - Equipe administrativa  
REFEREE (60) - Árbitros
CLUB (40) - Clubes e Times
ATHLETE (20) - Atletas
FAN (10) - Torcedores';
