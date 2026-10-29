// Compatibility entrypoint. Run npm run test:e2e for the maintained browser suite.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url)), 'test', ...process.argv.slice(2)], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'inherit' });
process.exit(result.status ?? 1);
