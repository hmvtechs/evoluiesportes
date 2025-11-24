-- ========================================
-- LIMPEZA FORÇADA DE TODAS AS TABELAS
-- ========================================
-- ⚠️ ATENÇÃO: ISTO APAGA TUDO IRREVERSIVELMENTE!
-- ========================================

-- PASSO 1: Remover constraint password_hash
ALTER TABLE "User" ALTER COLUMN "password_hash" DROP NOT NULL;

-- PASSO 2: Deletar de todas as tabelas (ordem correta para evitar FK errors)

-- Dados de partidas
DELETE FROM "MatchEvent";
DELETE FROM "GameMatch";

-- Inscrições e atletas
DELETE FROM "AthleteInscription";
DELETE FROM "TeamRegistration";

-- Competições
DELETE FROM "Group";
DELETE FROM "Phase";
DELETE FROM "CompetitionVenue";
DELETE FROM "Competition";

-- Times e organizações
DELETE FROM "Team";
DELETE FROM "Organization";

-- Locais e reservas
DELETE FROM "Booking";
DELETE FROM "Venue";

-- Modalidades (descomente se quiser apagar)
-- DELETE FROM "Modality";

-- Perfis e usuários
DELETE FROM "AthleteProfile";
DELETE FROM "User";

-- PASSO 3: Verificar se está vazio
SELECT 
    'User' as tabela, COUNT(*) as total FROM "User"
UNION ALL
SELECT 'Competition', COUNT(*) FROM "Competition"
UNION ALL
SELECT 'Team', COUNT(*) FROM "Team"
UNION ALL
SELECT 'Organization', COUNT(*) FROM "Organization"
UNION ALL
SELECT 'Match', COUNT(*) FROM "GameMatch"
UNION ALL
SELECT 'Venue', COUNT(*) FROM "Venue"
UNION ALL
SELECT 'Booking', COUNT(*) FROM "Booking";

-- Resultado esperado: TUDO em 0
