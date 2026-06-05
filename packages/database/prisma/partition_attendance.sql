-- Partitioning helper for Attendance table (safer approach using LIKE)
-- WARNING: Review and run on a non-production database first.
-- This creates a partitioned parent table based on the existing `attendance` table structure.

BEGIN;

-- Create partitioned parent table using the original table structure
CREATE TABLE IF NOT EXISTS attendance_partitioned (LIKE attendance INCLUDING ALL) PARTITION BY RANGE (date);

-- create current year partition if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = format('attendance_y_%s', date_part('year', CURRENT_DATE)::int)
  ) THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS attendance_y_%s PARTITION OF attendance_partitioned FOR VALUES FROM (''%s-01-01'') TO (''%s-01-01'')', date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int+1);
  END IF;
END$$;

COMMIT;
