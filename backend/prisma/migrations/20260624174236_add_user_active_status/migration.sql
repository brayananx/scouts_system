-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inactiveDate" TIMESTAMP(3),
ADD COLUMN     "inactiveReason" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
