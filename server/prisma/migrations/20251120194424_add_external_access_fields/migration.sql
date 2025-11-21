-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "sex" TEXT,
    "birth_date" DATETIME,
    "nationality" TEXT,
    "place_of_birth" TEXT,
    "photo_url" TEXT,
    "rf_status" TEXT NOT NULL DEFAULT 'PENDING',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "is_obfuscated" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "city" TEXT,
    "state" TEXT,
    "privacy_level" TEXT NOT NULL DEFAULT 'PRIVATE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("birth_date", "cpf", "created_at", "email", "full_name", "id", "is_obfuscated", "nationality", "password_hash", "phone", "photo_url", "place_of_birth", "rf_status", "role", "sex", "two_factor_secret", "updated_at") SELECT "birth_date", "cpf", "created_at", "email", "full_name", "id", "is_obfuscated", "nationality", "password_hash", "phone", "photo_url", "place_of_birth", "rf_status", "role", "sex", "two_factor_secret", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
