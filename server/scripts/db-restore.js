const { spawnSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;
const isDryRun = process.argv.includes('--dry-run');
const fileArgIndex = process.argv.findIndex((arg) => arg === '--file');
const backupFile =
  fileArgIndex > -1 && process.argv[fileArgIndex + 1]
    ? process.argv[fileArgIndex + 1]
    : null;

if (!backupFile) {
  console.error('Provide backup file path: --file <path-to-dump>');
  process.exit(1);
}

const args = [
  '--clean',
  '--if-exists',
  '--no-owner',
  '--no-privileges',
  '--dbname',
  databaseUrl || '<DATABASE_URL>',
  backupFile,
];

if (isDryRun) {
  console.log('[DRY RUN] pg_restore', args.join(' '));
  process.exit(0);
}

if (!databaseUrl) {
  console.error('DATABASE_URL is required for restore');
  process.exit(1);
}

const result = spawnSync('pg_restore', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Restore completed from: ${backupFile}`);
