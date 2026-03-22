const { spawnSync } = require('child_process');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const isDryRun = process.argv.includes('--dry-run');
const fileArgIndex = process.argv.findIndex((arg) => arg === '--file');
const outputFile =
  fileArgIndex > -1 && process.argv[fileArgIndex + 1]
    ? process.argv[fileArgIndex + 1]
    : path.resolve(
        process.cwd(),
        `backup-${new Date().toISOString().replace(/[.:]/g, '-')}.dump`,
      );

const args = [
  '--format=custom',
  '--no-owner',
  '--no-privileges',
  '--file',
  outputFile,
  databaseUrl || '<DATABASE_URL>',
];

if (isDryRun) {
  console.log('[DRY RUN] pg_dump', args.join(' '));
  process.exit(0);
}

if (!databaseUrl) {
  console.error('DATABASE_URL is required for backup');
  process.exit(1);
}

const result = spawnSync('pg_dump', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Backup completed: ${outputFile}`);
