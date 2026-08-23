-- Records each weekly digest that goes out, so the next issue has a definite
-- starting point, a double send is obvious rather than silent, and there is a
-- record of what went out without any per-recipient tracking.

-- CreateTable
CREATE TABLE "NewsletterIssue" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "articleSlugs" TEXT[],
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterIssue_number_key" ON "NewsletterIssue"("number");

-- CreateIndex
CREATE INDEX "NewsletterIssue_sentAt_idx" ON "NewsletterIssue"("sentAt");
