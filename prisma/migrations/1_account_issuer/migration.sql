-- Better Auth 1.7 writes an `issuer` on every Account row and uniquely indexes
-- it together with accountId. The older documented schema this table was written
-- from did not have it, so sign-up failed with "Unknown argument `issuer`".

-- Added with a default so the statement is safe against existing rows, then the
-- default is dropped: Better Auth always supplies the value itself, and leaving
-- a default would quietly mask a future column it stops writing.
ALTER TABLE "Account" ADD COLUMN "issuer" TEXT NOT NULL DEFAULT 'local:credential';
ALTER TABLE "Account" ALTER COLUMN "issuer" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
