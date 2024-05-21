/*
  Warnings:

  - Added the required column `interestCompounds` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentInterval` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "interestRate" REAL NOT NULL,
    "interestCompounds" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startAt" REAL NOT NULL,
    "paymentInterval" INTEGER NOT NULL
);
INSERT INTO "new_Loan" ("amount", "createdAt", "id", "interestRate", "name", "publicId", "startAt", "status", "term", "updatedAt") SELECT "amount", "createdAt", "id", "interestRate", "name", "publicId", "startAt", "status", "term", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_publicId_key" ON "Loan"("publicId");
PRAGMA foreign_key_check("Loan");
PRAGMA foreign_keys=ON;
