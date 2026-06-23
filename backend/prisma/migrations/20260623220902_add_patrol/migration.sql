-- AlterTable
ALTER TABLE "User" ADD COLUMN     "patrolId" TEXT;

-- CreateTable
CREATE TABLE "Patrol" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Patrol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patrol_name_key" ON "Patrol"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_patrolId_fkey" FOREIGN KEY ("patrolId") REFERENCES "Patrol"("id") ON DELETE SET NULL ON UPDATE CASCADE;
