/**
 * @param {string[]} values
 * @returns {string | null}
 */
function mostCommon(values) {
  if (!values.length) return null;
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = values[0];
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

/**
 * @param {Array<{ payload: unknown }>} completions
 */
export function computeFeelingsJournalInsights(completions) {
  const emotions = [];
  const reasons = [];

  for (const row of completions) {
    const payload = row.payload;
    if (!payload || typeof payload !== 'object') continue;
    const record = /** @type {Record<string, unknown>} */ (payload);
    if (typeof record.feeling === 'string') emotions.push(record.feeling);
    if (typeof record.reason === 'string') reasons.push(record.reason);
  }

  if (emotions.length === 0) {
    return null;
  }

  return {
    mostCommonEmotion: mostCommon(emotions),
    mostCommonReason: mostCommon(reasons),
    entryCount: completions.length,
  };
}
