-- AlterTable
ALTER TABLE "RegistrationRequest" ADD COLUMN "referenceId" TEXT,
ADD COLUMN "applicantRole" TEXT NOT NULL DEFAULT 'OWNER',
ADD COLUMN "additionalDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "verificationMethod" TEXT NOT NULL DEFAULT 'DNS_TXT',
ADD COLUMN "verificationToken" TEXT,
ADD COLUMN "verificationProof" TEXT,
ADD COLUMN "adminNote" TEXT,
ALTER COLUMN "applicantCountry" SET DEFAULT 'Global';

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_referenceId_key" ON "RegistrationRequest"("referenceId");

-- CreateIndex
CREATE INDEX "RegistrationRequest_referenceId_idx" ON "RegistrationRequest"("referenceId");

