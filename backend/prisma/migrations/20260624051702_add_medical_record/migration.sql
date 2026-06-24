-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "bloodType" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "medicalConditions" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "guardianName" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_userId_key" ON "MedicalRecord"("userId");

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
