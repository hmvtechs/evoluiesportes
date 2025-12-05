-- Organization Contact Fields Migration
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- Step 1: Make CNPJ nullable
ALTER TABLE "Organization" ALTER COLUMN "cnpj" DROP NOT NULL;

-- Step 2: Add new contact fields
ALTER TABLE "Organization" 
  ADD COLUMN IF NOT EXISTS "team_manager_name" TEXT,
  ADD COLUMN IF NOT EXISTS "team_manager_contact" TEXT,
  ADD COLUMN IF NOT EXISTS "coach_name" TEXT,
  ADD COLUMN IF NOT EXISTS "coach_contact" TEXT;

-- Step 3: Verify columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Organization'
AND table_schema = 'public'
ORDER BY ordinal_position;
