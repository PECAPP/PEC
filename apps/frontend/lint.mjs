import { execSync } from 'child_process';
try {
  execSync('npx next lint', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
