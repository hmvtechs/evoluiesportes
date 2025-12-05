-- Make Team.championship_id nullable to allow team creation without championship
ALTER TABLE "Team" ALTER COLUMN "championship_id" DROP NOT NULL;
