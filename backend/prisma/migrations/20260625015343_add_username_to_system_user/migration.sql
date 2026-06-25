/*
  Warnings:

  - You are about to drop the column `email` on the `SystemUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `SystemUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SystemUser_email_key";

-- AlterTable
ALTER TABLE "SystemUser" DROP COLUMN "email",
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SystemUser_username_key" ON "SystemUser"("username");
