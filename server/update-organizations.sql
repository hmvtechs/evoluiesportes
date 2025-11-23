-- ========================================
-- SCRIPT DE ATUALIZAÇÃO DE ORGANIZAÇÕES
-- ========================================

-- PASSO 1: Ver todas as organizações atuais
-- Execute isto primeiro para ver o que existe:

SELECT 
    id,
    name_official AS "Nome Atual",
    cnpj AS "CNPJ"
FROM "Organization"
ORDER BY id;

-- ========================================
-- PASSO 2: Atualizar Nomes
-- ========================================

-- EXEMPLO 1: Atualizar uma organização específica por ID
-- Substitua 'Nome do Clube Real' pelo nome desejado
UPDATE "Organization"
SET name_official = 'Nome do Clube Real'
WHERE id = 2;  -- Substitua pelo ID correto

-- EXEMPLO 2: Atualizar múltiplas organizações de uma vez
-- Copie e adapte conforme necessário:

UPDATE "Organization"
SET name_official = 'Clube Esportivo ABC'
WHERE id = 1;

UPDATE "Organization"
SET name_official = 'Associação Desportiva XYZ'
WHERE id = 2;

UPDATE "Organization"
SET name_official = 'Time dos Campeões'
WHERE id = 3;

-- EXEMPLO 3: Atualizar também o CNPJ (se necessário)
UPDATE "Organization"
SET 
    name_official = 'Nome do Clube',
    cnpj = '12.345.678/0001-90'
WHERE id = 2;

-- ========================================
-- PASSO 3: Verificar as mudanças
-- ========================================

SELECT 
    id,
    name_official AS "Novo Nome",
    cnpj AS "CNPJ",
    manager_user_id AS "Gestor (User ID)"
FROM "Organization"
ORDER BY id;

-- ========================================
-- COMANDOS ÚTEIS
-- ========================================

-- Ver quais times pertencem a cada organização:
SELECT 
    o.id AS org_id,
    o.name_official AS "Organização",
    t.id AS team_id,
    t.category AS "Categoria"
FROM "Organization" o
LEFT JOIN "Team" t ON t.organization_id = o.id
ORDER BY o.id, t.id;

-- Ver times inscritos em competições:
SELECT 
    c.name AS "Competição",
    o.name_official AS "Clube",
    t.category AS "Categoria",
    tr.status AS "Status"
FROM "TeamRegistration" tr
JOIN "Team" t ON tr.team_id = t.id
JOIN "Organization" o ON t.organization_id = o.id
JOIN "Competition" c ON tr.competition_id = c.id
ORDER BY c.id, o.name_official;

-- ========================================
-- CRIAR NOVA ORGANIZAÇÃO (se precisar)
-- ========================================

INSERT INTO "Organization" (name_official, cnpj, manager_user_id)
VALUES (
    'Nome do Novo Clube',
    '00.000.000/0000-00',
    NULL  -- Ou coloque o ID do usuário gestor
);

-- ========================================
-- DICAS
-- ========================================

/*
1. Execute o PASSO 1 primeiro para ver os IDs
2. Copie os comandos UPDATE do PASSO 2
3. Substitua os valores pelos nomes reais
4. Execute no Supabase SQL Editor
5. Execute o PASSO 3 para confirmar
6. Recarregue o frontend
*/
