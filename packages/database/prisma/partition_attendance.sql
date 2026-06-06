-- This script converts the existing Attendance table into a Range-Partitioned table.
-- WARNING: Prisma requires the partition key to be part of the Primary Key for partitioned tables.
-- You must update schema.prisma to:
-- @@id([id, date])
-- after running this script to ensure Prisma recognizes the composite primary key.

BEGIN;

-- 1. Rename the existing table created by Prisma
ALTER TABLE "Attendance" RENAME TO "Attendance_old";

-- 2. Create the new Partitioned Table
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "markedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT DEFAULT 'manual',
    "courseId" TEXT,
    "facultyId" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id", "date")
) PARTITION BY RANGE ("date");

-- 3. Create initial partitions for the next few months
CREATE TABLE "Attendance_2026_06" PARTITION OF "Attendance" FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE "Attendance_2026_07" PARTITION OF "Attendance" FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE "Attendance_2026_08" PARTITION OF "Attendance" FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE "Attendance_2026_09" PARTITION OF "Attendance" FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- 4. Create necessary indexes (indexes on partitioned tables cascade to their partitions)
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");

-- 5. Copy data from the old table (filtering for valid ranges)
INSERT INTO "Attendance" 
SELECT * FROM "Attendance_old" 
WHERE "date" >= '2026-06-01' AND "date" < '2026-10-01';

-- 6. Drop the old table
DROP TABLE "Attendance_old";

COMMIT;
