-- Scaffold: Partition background_job by year
BEGIN;

-- Create partitioned parent table using the original table structure
CREATE TABLE IF NOT EXISTS background_job_partitioned (LIKE background_job INCLUDING ALL) PARTITION BY RANGE (createdAt);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = format('background_job_y_%s', date_part('year', CURRENT_DATE)::int)) THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS background_job_y_%s PARTITION OF background_job_partitioned FOR VALUES FROM (''%s-01-01'') TO (''%s-01-01'')', date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int+1);
  END IF;
END$$;

COMMIT;
