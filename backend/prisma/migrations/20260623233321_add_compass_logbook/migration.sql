/*
  Warnings:

  - A unique constraint covering the columns `[identityNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `identityNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "compassLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "logbookLevel" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "identityNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_identityNumber_key" ON "User"("identityNumber");
