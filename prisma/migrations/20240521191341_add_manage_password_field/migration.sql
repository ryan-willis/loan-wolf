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
    "paymentInterval" INTEGER NOT NULL,
    "managePassword" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Loan" ("amount", "createdAt", "id", "interestCompounds", "interestRate", "name", "paymentInterval", "publicId", "startAt", "status", "term", "updatedAt") SELECT "amount", "createdAt", "id", "interestCompounds", "interestRate", "name", "paymentInterval", "publicId", "startAt", "status", "term", "updatedAt" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_publicId_key" ON "Loan"("publicId");
PRAGMA foreign_key_check("Loan");
PRAGMA foreign_keys=ON;
