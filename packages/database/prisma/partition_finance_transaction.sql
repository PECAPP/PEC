-- Scaffold: Partition finance_transaction by year
BEGIN;

-- Create partitioned parent table using the original table structure
CREATE TABLE IF NOT EXISTS finance_transaction_partitioned (LIKE finance_transaction INCLUDING ALL) PARTITION BY RANGE (createdAt);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = format('finance_transaction_y_%s', date_part('year', CURRENT_DATE)::int)) THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS finance_transaction_y_%s PARTITION OF finance_transaction_partitioned FOR VALUES FROM (''%s-01-01'') TO (''%s-01-01'')', date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int, date_part('year', CURRENT_DATE)::int+1);
  END IF;
END$$;

COMMIT;
