Partitioning Plan (High-level)
=================================

This document provides a safe plan and SQL helper scripts to convert high-volume tables
to native Postgres partitioned tables with minimal downtime. It targets these candidate
tables found in the schema and commonly grow large in an academic system:

- `attendance` (by `date`)
- `background_job` (by `createdAt` / `availableAt`)
- `audit_log` (by `createdAt`)
- `finance_transaction` (by `createdAt`)

Overview
--------
1. Create a new partitioned parent table that matches the target table's columns.
2. Create child partitions (by year or month depending on retention/volume).
3. Copy existing data into partitions in batches.
4. Rename the original table to `_old` and create a trigger or view to route
   new inserts into the partitioned parent table.
5. Update foreign keys, constraints, and references as needed.
6. Validate application behavior, then drop the old table once satisfied.

Important notes
---------------
- Test this on staging and backups before running in production.
- Use carefully sized batch copy jobs to avoid long-running transactions.
- If your application (here, Prisma) depends on exact table metadata (indexes, constraints),
  apply those indexes on the partitioned parent or each child as required by Postgres.

Files
-----
- `partition_attendance.sql` — creates parent and helper function for attendance.
- `partition_auditlog.sql` — scaffold for audit_log.
- `partition_background_job.sql` — scaffold for background_job.
- `partition_finance_transaction.sql` — scaffold for finance_transaction.

How to run (example for attendance)
-----------------------------------
1. Back up your DB.
2. Create partitions for historical years:
   psql -d pec -f packages/database/prisma/partition_attendance.sql
3. Copy rows in batches (SQL uses INSERT INTO ... SELECT ... LIMIT ... OFFSET pattern).
4. When satisfied, rename the old table and replace with a view or keep parent and drop old.

If you want, I can produce a safe, runnable migration script that performs the steps in small chunks
and verifies counts in between. Request that and I'll create the migration runner and CI-friendly checks.
