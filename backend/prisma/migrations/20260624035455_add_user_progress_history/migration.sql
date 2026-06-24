/*
  Warnings:

  - A unique constraint covering the columns `[imageKey]` on the table `Specialty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageKey` to the `Specialty` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProgressType" AS ENUM ('COMPASS', 'LOGBOOK');

-- AlterTable
ALTER TABLE "Specialty" ADD COLUMN     "imageKey" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ProgressType" NOT NULL,
    "level" INTEGER NOT NULL,
    "obtainedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_type_level_key" ON "UserProgress"("userId", "type", "level");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_imageKey_key" ON "Specialty"("imageKey");

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
