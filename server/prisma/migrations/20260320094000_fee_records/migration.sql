CREATE TABLE IF NOT EXISTS "FeeRecord" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paidDate" TIMESTAMP(3),
  "pendingTransactionId" TEXT,
  "paymentTransactionId" TEXT,
  "lastPaymentAttempt" TIMESTAMP(3),
  "verificationSubmittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "FeeRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FeeRecord_studentId_status_idx" ON "FeeRecord"("studentId", "status");
CREATE INDEX IF NOT EXISTS "FeeRecord_dueDate_idx" ON "FeeRecord"("dueDate");
CREATE INDEX IF NOT EXISTS "FeeRecord_deletedAt_idx" ON "FeeRecord"("deletedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'FeeRecord_studentId_fkey'
  ) THEN
    ALTER TABLE "FeeRecord"
      ADD CONSTRAINT "FeeRecord_studentId_fkey"
      FOREIGN KEY ("studentId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
