-- 1. Partial Indexes for Soft Deletes (Speed up queries skipping deleted records)
CREATE INDEX IF NOT EXISTS "idx_course_active" ON "Course"("status") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_feerecord_active" ON "FeeRecord"("studentId", "status") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_notice_active" ON "Notice"("category") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_job_active" ON "Job"("deadline") WHERE "deletedAt" IS NULL;

-- 2. GIN Indexes for JSONB Columns (Lightning fast searches inside JSON)
-- Using gin_trgm_ops for text search inside JSON if needed, or default jsonb_ops
-- Ensure columns are JSONB in DB, Prisma uses Json.
CREATE INDEX IF NOT EXISTS "idx_hostelissue_responses_gin" ON "HostelIssue" USING GIN ("responses");
CREATE INDEX IF NOT EXISTS "idx_resumeprofile_skills_gin" ON "ResumeProfile" USING GIN ("skills");
CREATE INDEX IF NOT EXISTS "idx_resumeprofile_experience_gin" ON "ResumeProfile" USING GIN ("experience");

-- 3. Row-Level Security (RLS) - Example for Multi-Tenant Isolation
-- NOTE: To fully use this, you must SET app.current_user_id = '...' in your Prisma middleware/extension before querying.
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "attendance_tenant_isolation" ON "Attendance";

-- Create policy to only allow users to see their own attendance (or admins to see all)
CREATE POLICY "attendance_tenant_isolation" ON "Attendance"
    FOR ALL
    USING (
        "studentId" = current_setting('app.current_user_id', true) 
        OR current_setting('app.user_role', true) IN ('ADMIN', 'FACULTY')
    );

-- Enable RLS on other sensitive tables
ALTER TABLE "FeeRecord" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feerecord_tenant_isolation" ON "FeeRecord";
CREATE POLICY "feerecord_tenant_isolation" ON "FeeRecord"
    FOR ALL
    USING (
        "studentId" = current_setting('app.current_user_id', true) 
        OR current_setting('app.user_role', true) IN ('ADMIN', 'FINANCE')
    );
