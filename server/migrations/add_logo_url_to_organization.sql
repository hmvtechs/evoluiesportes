-- Add logo_url column to Organization table
-- Execute this SQL in Supabase Dashboard > SQL Editor

ALTER TABLE "Organization" 
  ADD COLUMN IF NOT EXISTS "logo_url" TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Organization'
AND table_schema = 'public'
ORDER BY ordinal_position;
