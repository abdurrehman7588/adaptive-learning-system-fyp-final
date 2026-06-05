import { prisma } from './prisma.js';

/** @type {boolean | null} */
let cachedReady = null;

/**
 * Prisma / Postgres error when a mapped table is missing (production not migrated).
 * @param {unknown} error
 */
export function isPrismaMissingTableError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = /** @type {{ code?: string, message?: string }} */ (error);
  if (record.code === 'P2021') {
    return true;
  }

  const message = record.message ?? '';
  return (
    /relation [`"]?public\.emotional_/i.test(message) ||
    /table [`"]?public\.emotional_/i.test(message) ||
    /does not exist in the current database/i.test(message)
  );
}

/** @param {{ force?: boolean }} [options] */
export async function isEmotionalSchemaReady(options = {}) {
  if (!options.force && cachedReady !== null) {
    return cachedReady;
  }

  try {
    await prisma.$queryRaw`SELECT 1 FROM "emotional_assessments" LIMIT 1`;
    cachedReady = true;
  } catch (error) {
    if (isPrismaMissingTableError(error)) {
      cachedReady = false;
      return false;
    }
    throw error;
  }

  return true;
}

export function markEmotionalSchemaUnavailable() {
  cachedReady = false;
}
