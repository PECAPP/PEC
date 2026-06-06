/**
 * Partition migrator
 * - Connects to the DB using DATABASE_URL
 * - For configured tables, creates partitioned parent (LIKE original)
 * - Creates year partitions for a given range
 * - Copies data in batches from original table into partitioned parent
 * - Verifies counts
 *
 * Usage: DATABASE_URL=... npx ts-node packages/database/scripts/partition_migrator.ts
 */
import { Client } from 'pg';

const BATCH_SIZE = 5000;

async function query(client: Client, sql: string, params: any[] = []) {
  return client.query(sql, params);
}

async function createParentAndPartitions(client: Client, table: string, dateCol: string) {
  console.log(`Creating partitioned parent for ${table}`);
  // create parent using LIKE
  await query(client, `CREATE TABLE IF NOT EXISTS ${table}_partitioned (LIKE ${table} INCLUDING ALL) PARTITION BY RANGE (${dateCol});`);

  // determine min and max year from table
  const res = await query(client, `SELECT EXTRACT(YEAR FROM MIN(${dateCol})) AS miny, EXTRACT(YEAR FROM MAX(${dateCol})) AS maxy FROM ${table};`);
  let minYear = res.rows[0].miny || new Date().getFullYear();
  let maxYear = res.rows[0].maxy || new Date().getFullYear();
  minYear = Math.max(2000, Math.floor(minYear));
  maxYear = Math.max(minYear, Math.floor(maxYear));

  const currentYear = new Date().getFullYear();
  if (maxYear < currentYear) maxYear = currentYear;

  for (let y = minYear; y <= maxYear; y++) {
    const partName = `${table}_y_${y}`;
    const from = `${y}-01-01`;
    const to = `${y + 1}-01-01`;
    await query(client, `CREATE TABLE IF NOT EXISTS ${partName} PARTITION OF ${table}_partitioned FOR VALUES FROM ('${from}') TO ('${to}');`);
    console.log(`  ensured partition ${partName}`);
  }
}

async function copyInBatches(client: Client, table: string) {
  console.log(`Copying data for ${table}`);
  // get total count
  const cntRes = await query(client, `SELECT COUNT(*) AS cnt FROM ${table};`);
  const total = parseInt(cntRes.rows[0].cnt, 10);
  console.log(`  total rows: ${total}`);

  let offset = 0;
  while (offset < total) {
    const idsRes = await query(client, `SELECT id FROM ${table} ORDER BY id LIMIT ${BATCH_SIZE} OFFSET ${offset};`);
    const ids = idsRes.rows.map((r: any) => `'${r.id}'`).join(',');
    if (!ids) break;
    const insertSql = `INSERT INTO ${table}_partitioned SELECT * FROM ${table} WHERE id IN (${ids}) ON CONFLICT DO NOTHING;`;
    await query(client, insertSql);
    offset += BATCH_SIZE;
    console.log(`  copied ${Math.min(offset, total)} / ${total}`);
  }
}

async function verifyCounts(client: Client, table: string) {
  const orig = (await query(client, `SELECT COUNT(*) AS cnt FROM ${table};`)).rows[0].cnt;
  const part = (await query(client, `SELECT COUNT(*) AS cnt FROM ${table}_partitioned;`)).rows[0].cnt;
  console.log(`  verify ${table}: original=${orig}, partitioned=${part}`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Please set DATABASE_URL');
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  await client.connect();

  const targets = [
    { table: 'attendance', dateCol: 'date' },
    { table: 'audit_log', dateCol: 'createdAt' },
    { table: 'background_job', dateCol: 'createdAt' },
    { table: 'finance_transaction', dateCol: 'createdAt' },
  ];

  for (const t of targets) {
    try {
      await createParentAndPartitions(client, t.table, t.dateCol);
      await copyInBatches(client, t.table);
      await verifyCounts(client, t.table);
      console.log(`Finished processing ${t.table}`);
    } catch (e) {
      console.error(`Failed processing ${t.table}:`, e?.message || e);
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
