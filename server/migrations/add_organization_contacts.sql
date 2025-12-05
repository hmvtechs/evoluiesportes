-- Migration: Add Organization Contact Fields and Make CNPJ Optional
-- Date: 2025-12-03
-- Description: Enhance Organization model with team manager and coach contact information

-- Step 1: Make CNPJ optional (nullable)
ALTER TABLE "Organization" ALTER COLUMN "cnpj" DROP NOT NULL;

-- Step 2: Add new contact fields
ALTER TABLE "Organization" 
  ADD COLUMN IF NOT EXISTS "team_manager_name" TEXT,
  ADD COLUMN IF NOT EXISTS "team_manager_contact" TEXT,
  ADD COLUMN IF NOT EXISTS "coach_name" TEXT,
  ADD COLUMN IF NOT EXISTS "coach_contact" TEXT;

-- Verify changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Organization'
ORDER BY ordinal_position;
