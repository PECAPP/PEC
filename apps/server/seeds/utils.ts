import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/pec';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase concurrent connections for seeding
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export function sample<T>(items: T[], index: number): T {
  return items[index % items.length];
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

export function batchForSemester(semester: number) {
  const currentYear = new Date().getFullYear();
  switch (semester) {
    case 1:
    case 2:
      return `${currentYear}-${currentYear + 4}`;
    case 3:
    case 4:
      return `${currentYear - 1}-${currentYear + 3}`;
    case 5:
    case 6:
      return `${currentYear - 2}-${currentYear + 2}`;
    case 7:
    case 8:
      return `${currentYear - 3}-${currentYear + 1}`;
    default:
      return `${currentYear}-${currentYear + 4}`;
  }
}

export async function clearDatabase() {
  if (process.env.SKIP_WIPE === 'true') {
     console.log('Skipping database wipe (SKIP_WIPE=true)');
     return;
  }

  console.log('Starting full database wipe (Fast Truncate)...');
  
  await prisma.$transaction(async (tx) => {
    // Disable postgres statement timeout for this transaction so it doesn't get killed
    await tx.$executeRawUnsafe('SET LOCAL statement_timeout = 0;');
    await tx.$executeRawUnsafe(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename != '_prisma_migrations') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
  }, { timeout: 30000 });

  console.log('Database wipe completed.');
}

export function encryptField(value: string) {
  // Mock encryption for seeding as used in original script
  return value;
}
