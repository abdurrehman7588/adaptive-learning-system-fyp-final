/**
 * Production entrypoint for Render and similar hosts.
 * Applies pending Prisma migrations, regenerates the client, then starts the API.
 *
 * Set SKIP_DB_MIGRATE=true to skip migrate deploy (local emergency only).
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

function runStep(label, command, args) {
  console.log(`[start-production] ${label}…`);
  const result = spawnSync(command, args, {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`[start-production] ${label} failed (exit ${result.status ?? 1})`);
    process.exit(result.status ?? 1);
  }
}

const skipMigrate = process.env.SKIP_DB_MIGRATE === 'true';

if (!process.env.DATABASE_URL?.trim()) {
  console.error('[start-production] DATABASE_URL is required');
  process.exit(1);
}

if (!skipMigrate) {
  runStep('prisma migrate deploy', 'npx', ['prisma', 'migrate', 'deploy']);
} else {
  console.warn('[start-production] SKIP_DB_MIGRATE=true — skipping prisma migrate deploy');
}

runStep('prisma generate', 'npx', ['prisma', 'generate']);

const { isEmotionalSchemaReady } = await import('../src/shared/db/emotionalSchema.js');
const eiReady = await isEmotionalSchemaReady({ force: true });
if (!eiReady) {
  console.warn(
    '[start-production] Emotional intelligence tables are still missing after migrate deploy. ' +
      'EI endpoints will return schemaStatus=unavailable until migrations succeed.',
  );
}

await import('../src/server.js');
