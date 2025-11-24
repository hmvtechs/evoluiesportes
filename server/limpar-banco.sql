-- ========================================
-- SCRIPT DE LIMPEZA TOTAL DO BANCO
-- ========================================
-- Este script apaga TODOS os dados de teste
-- e deixa apenas 1 usuário administrador
-- ========================================

-- ATENÇÃO: ESTE SCRIPT É IRREVERSÍVEL!
-- Faça backup antes de executar se necessário

-- ========================================
-- PASSO 1: DELETAR TODOS OS DADOS
-- ========================================

-- 1. Matches e dados relacionados
DELETE FROM "GameMatch";
DELETE FROM "MatchEvent";

-- 2. Competições e dados relacionados
DELETE FROM "TeamRegistration";
DELETE FROM "CompetitionVenue";
DELETE FROM "Group";
DELETE FROM "Phase";
DELETE FROM "Competition";

-- 3. Times e organizações
DELETE FROM "Team";
DELETE FROM "Organization";

-- 4. Locais e reservas
DELETE FROM "Booking";
DELETE FROM "Venue";

-- 5. Modalidades (opcional - descomente se quiser apagar)
-- DELETE FROM "Modality";

-- 6. Usuários na tabela pública
DELETE FROM "User";

-- ========================================
-- PASSO 2: CRIAR USUÁRIO ADMINISTRADOR
-- ========================================

-- ATENÇÃO: Execute este INSERT depois de criar o usuário no Supabase Auth!
-- Siga as instruções no PASSO 3 primeiro!

-- Substitua o UUID abaixo pelo ID real do usuário criado no Supabase
-- INSERT INTO "User" (
--     id,
--     email,
--     cpf,
--     full_name,
--     role,
--     rf_status,
--     created_at,
--     updated_at
-- ) VALUES (
--     'COLE-AQUI-O-UUID-DO-USUARIO',  -- ID do auth.users
--     'admin@sistema.com',
--     '00000000000',
--     'Administrador',
--     'ADMIN',
--     'VALID',
--     NOW(),
--     NOW()
-- );

-- ========================================
-- PASSO 3: LIMPAR auth.users (VIA DASHBOARD)
-- ========================================

-- A tabela auth.users só pode ser modificada via Dashboard:
-- 1. Acesse: https://app.supabase.com/
-- 2. Seu projeto → Authentication → Users
-- 3. Selecione TODOS os usuários
-- 4. Delete All
-- 5. Clique em "Add User" → "Create new user"
-- 6. Preencha:
--    Email: admin@sistema.com
--    Password: Admin@123 (ou sua senha preferida)
--    Auto Confirm User: MARQUE ESTA OPÇÃO!
-- 7. Clique em "Create user"
-- 8. Copie o ID do usuário (UUID)
-- 9. Volte aqui e execute o INSERT acima com esse UUID

-- ========================================
-- PASSO 4: VERIFICAR LIMPEZA
-- ========================================

-- Verificar se está vazio:
SELECT 'Users' as tabela, COUNT(*) as total FROM "User"
UNION ALL
SELECT 'Competitions', COUNT(*) FROM "Competition"
UNION ALL
SELECT 'Teams', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Organizations', COUNT(*) FROM "Organization"
UNION ALL
SELECT 'Matches', COUNT(*) FROM "GameMatch"
UNION ALL
SELECT 'Venues', COUNT(*) FROM "Venue";

-- Deve mostrar 0 em todas (exceto Users = 1)

-- ========================================
-- ALTERNATIVA: CRIAR ADMIN VIA SCRIPT
-- ========================================

-- Se preferir, use o script Node.js (mais fácil):
-- cd server
-- node create-admin.js
