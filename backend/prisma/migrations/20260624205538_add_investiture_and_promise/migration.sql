-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isInvested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promiseDate" TIMESTAMP(3);
