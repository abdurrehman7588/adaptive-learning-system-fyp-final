/**
 * Smoke-test ML recommendation prediction (model + rules fallback).
 *
 * Run: node scripts/verify-ml-recommendation.mjs
 */

import { predictRecommendationLevel } from '../src/modules/ai/services/mlPrediction.service.js';
import { buildStudentFeatures } from '../src/modules/ai/services/studentFeatures.service.js';
import { ruleBasedRecommendationLevel } from '../src/modules/adaptive/adaptiveRules.js';

const samples = [
  { average_score: 25, quiz_attempts: 3, completion_rate: 40, emotional_score: 45 },
  { average_score: 55, quiz_attempts: 8, completion_rate: 75, emotional_score: 62 },
  { average_score: 88, quiz_attempts: 12, completion_rate: 95, emotional_score: 80 },
];

console.log('Rule-based fallback samples:');
for (const features of samples) {
  const rules = ruleBasedRecommendationLevel(features);
  console.log(`  avg=${features.average_score} -> ${rules.recommendation} (${rules.confidence})`);
}

console.log('\nModel predictions:');
for (const features of samples) {
  const result = await predictRecommendationLevel(features, 0);
  console.log(
    `  avg=${features.average_score} -> ${result.recommendation} (${result.confidence}) [${result.source}]`,
  );
}

const fromAttempts = buildStudentFeatures([], null);
console.log('\nEmpty attempts features:', fromAttempts);

console.log('\nML recommendation verify OK');
