-- CreateTable
CREATE TABLE "Competition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "modality_id" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "min_athletes" INTEGER,
    "max_athletes" INTEGER,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Competition_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "Modality" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competition_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Phase_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phase_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Group_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "Phase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamRegistration_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamRegistration_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AthleteInscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team_registration_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VALID',
    CONSTRAINT "AthleteInscription_team_registration_id_fkey" FOREIGN KEY ("team_registration_id") REFERENCES "TeamRegistration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AthleteInscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "category" TEXT,
    "pix_key" TEXT,
    "functions" TEXT,
    "card_valid_until" DATETIME,
    CONSTRAINT "Referee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Referee_user_id_key" ON "Referee"("user_id");
