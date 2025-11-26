-- Tournament Management System Enhancements
-- Migration: Add fields for Team details, Match winner, and unique constraints

-- Add fields to Team table for logo, coach, and contact information
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "coach_name" TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;

-- Add winner field to GameMatch to track match results
ALTER TABLE "GameMatch" ADD COLUMN IF NOT EXISTS "winner_id" INTEGER;
ALTER TABLE "GameMatch" ADD CONSTRAINT "GameMatch_winner_id_fkey" 
  FOREIGN KEY ("winner_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraint to prevent duplicate team registrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TeamRegistration_competition_team_unique'
  ) THEN
    ALTER TABLE "TeamRegistration" ADD CONSTRAINT "TeamRegistration_competition_team_unique"
      UNIQUE ("competition_id", "team_id");
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "idx_team_registration_status" ON "TeamRegistration"("status");
CREATE INDEX IF NOT EXISTS "idx_game_match_round" ON "GameMatch"("competition_id", "round_number");
