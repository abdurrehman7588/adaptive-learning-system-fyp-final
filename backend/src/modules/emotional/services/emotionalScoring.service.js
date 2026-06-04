import { EI_DIMENSIONS } from '../constants/eiCatalog.js';

/**
 * @param {number} value 1-4
 */
export function percentFromLikertValue(value) {
  const clamped = Math.max(1, Math.min(4, value));
  return Math.round((((clamped - 1) / 3) * 100) * 100) / 100;
}

/**
 * @param {number} percent 0-100
 * @returns {'developing' | 'good' | 'strong'}
 */
export function statusFromPercent(percent) {
  if (percent < 50) return 'developing';
  if (percent < 75) return 'good';
  return 'strong';
}

/**
 * @param {Record<string, number[]>} valuesByDimension dimension -> [1-4] x4
 */
export function scoreAssessment(valuesByDimension) {
  /** @type {Record<string, { percent: number, status: string }>} */
  const categories = {};
  let overallSum = 0;

  for (const dimension of EI_DIMENSIONS) {
    const values = valuesByDimension[dimension] ?? [];
    const avg = values.length
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : 1;
    const percent = Math.round((((avg - 1) / 3) * 100) * 100) / 100;
    categories[dimension] = {
      percent,
      status: statusFromPercent(percent),
    };
    overallSum += percent;
  }

  const overallPercent = Math.round((overallSum / EI_DIMENSIONS.length) * 100) / 100;

  return {
    categories,
    overallPercent,
  };
}

/**
 * @param {{ self_awareness: number, empathy: number, self_regulation: number }} percents
 * @returns {{ strongest: string, weakest: string }}
 */
export function strongestWeakest(percents) {
  const entries = Object.entries(percents);
  entries.sort((a, b) => b[1] - a[1]);
  return {
    strongest: entries[0]?.[0] ?? 'self_awareness',
    weakest: entries[entries.length - 1]?.[0] ?? 'self_awareness',
  };
}
