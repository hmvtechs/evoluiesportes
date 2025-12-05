-- Step 1: Make Team.championship_id nullable
ALTER TABLE "Team" ALTER COLUMN "championship_id" DROP NOT NULL;

-- Step 2: Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Team'
AND column_name = 'championship_id';
