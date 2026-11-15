ALTER TABLE "Certificate"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "revocationReason" TEXT,
  ADD COLUMN "revokedAt" TIMESTAMP(3);

ALTER TABLE "AuditLog"
  ADD COLUMN "details" TEXT;
