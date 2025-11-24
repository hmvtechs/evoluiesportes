-- ========================================
-- CORREÇÃO: Remover constraint NOT NULL de password_hash
-- ========================================
-- A senha NÃO deve ficar na tabela User!
-- Ela fica em auth.users (gerenciada pelo Supabase)

ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Se quiser, pode até remover a coluna completamente:
-- ALTER TABLE "User" DROP COLUMN "password_hash";

-- Verificar:
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'password_hash';
