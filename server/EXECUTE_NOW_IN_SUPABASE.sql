-- CORRIGIR ROLE DO USUÁRIO ADMIN
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar usuários atuais
SELECT id, email, role FROM "User" WHERE email = 'admin@sistema.com';

-- 2. Atualizar role para ADMIN
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@sistema.com';

-- 3. Verificar que foi atualizado
SELECT id, email, role FROM "User" WHERE email = 'admin@sistema.com';

-- Se ainda não funcionar, verifique se o token JWT no navegador contém o role correto
-- Pode ser necessário fazer logout e login novamente para renovar o token
