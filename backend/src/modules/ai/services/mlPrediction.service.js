import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ruleBasedRecommendationLevel } from '../../adaptive/adaptiveRules.js';
import { buildAdaptiveProfile } from '../../adaptive/adaptiveScore.service.js';
import { logger } from '../../../shared/utils/logger.js';
import { toModelInputFeatures } from './studentFeatures.service.js';

const BACKEND_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const PREDICT_SCRIPT = path.join(BACKEND_ROOT, 'ml', 'predict_recommendation.py');
const PREDICT_TIMEOUT_MS = 8000;

const PYTHON_COMMANDS = ['python', 'python3', 'py'];

/**
 * @param {Record<string, number>} features
 * @returns {Promise<{ recommendation: string, confidence: number }>}
 */
function invokePythonPredictor(features) {
  return new Promise((resolve, reject) => {
    if (!existsSync(PREDICT_SCRIPT)) {
      reject(new Error(`Predict script not found: ${PREDICT_SCRIPT}`));
      return;
    }

    const command = resolvePythonCommand();
    const child = spawn(command, [PREDICT_SCRIPT], {
      cwd: BACKEND_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error('ML prediction timed out'));
    }, PREDICT_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(stderr.trim() || `Python predictor exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(normalizeModelPrediction(parsed));
      } catch (error) {
        reject(
          new Error(
            `Invalid predictor output: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    });

    child.stdin.write(JSON.stringify(features));
    child.stdin.end();
  });
}

function resolvePythonCommand() {
  const fromEnv = process.env.ML_PYTHON?.trim();
  if (fromEnv) return fromEnv;
  return PYTHON_COMMANDS[0];
}

/**
 * @param {{ recommendation?: string, confidence?: number }} payload
 */
function normalizeModelPrediction(payload) {
  const recommendation = normalizeRecommendationLabel(payload.recommendation);
  const confidence =
    payload.confidence !== undefined && payload.confidence !== null
      ? Math.round(Number(payload.confidence) * 10000) / 10000
      : null;

  if (!recommendation) {
    throw new Error('Predictor returned an empty recommendation label');
  }

  return {
    recommendation,
    confidence: confidence ?? 0.5,
  };
}

/**
 * @param {string | undefined | null} label
 * @returns {'Easy' | 'Medium' | 'Hard' | null}
 */
function normalizeRecommendationLabel(label) {
  if (!label) return null;
  const normalized = String(label).trim().toLowerCase();
  if (normalized === 'easy') return 'Easy';
  if (normalized === 'medium') return 'Medium';
  if (normalized === 'hard') return 'Hard';
  return null;
}

/**
 * @param {ReturnType<import('./studentFeatures.service.js').buildStudentFeatures>} features
 * @param {number | null} [childId]
 * @param {ReturnType<import('../../adaptive/adaptiveScore.service.js').buildAdaptiveFeatures> | null} [adaptiveFeatures]
 */
export async function predictRecommendationLevel(features, childId = null, adaptiveFeatures = null) {
  const modelInput = toModelInputFeatures(features);
  const enrichedFeatures = adaptiveFeatures
    ? { ...features, ...adaptiveFeatures }
    : features;

  try {
    const modelResult = await invokePythonPredictor(modelInput);
    const mlPrediction = {
      recommendation: modelResult.recommendation,
      confidence: modelResult.confidence,
      source: 'model',
    };

    const adaptiveProfile = adaptiveFeatures
      ? buildAdaptiveProfile(adaptiveFeatures, mlPrediction)
      : null;

    const prediction = {
      recommendation: adaptiveProfile?.recommendation ?? mlPrediction.recommendation,
      confidence: adaptiveProfile?.confidence ?? mlPrediction.confidence,
      source: adaptiveProfile?.source ?? mlPrediction.source,
      features: enrichedFeatures,
      adaptiveProfile,
    };

    logger.info('[ml-recommendation] prediction', {
      childId,
      source: prediction.source,
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      adaptiveScore: adaptiveProfile?.adaptiveScore ?? null,
      learnerLevel: adaptiveProfile?.learnerLevel ?? null,
      blend: adaptiveProfile?.blend ?? null,
      features: enrichedFeatures,
    });

    return prediction;
  } catch (error) {
    const fallback = ruleBasedRecommendationLevel(enrichedFeatures);
    const mlPrediction = {
      recommendation: fallback.recommendation,
      confidence: fallback.confidence,
      source: 'rules',
    };

    const adaptiveProfile = adaptiveFeatures
      ? buildAdaptiveProfile(adaptiveFeatures, mlPrediction)
      : buildAdaptiveProfile(
          {
            average_score: Number(features.average_score ?? 0),
            completion_rate: Number(features.completion_rate ?? 0),
            emotional_score: features.emotional_score ?? null,
            emotional_assessed: features.emotional_assessed ?? false,
            performance_trend: Number(enrichedFeatures.performance_trend ?? 50),
            trendDirection: enrichedFeatures.trendDirection ?? 'insufficient_data',
            trendChangePercent: enrichedFeatures.trendChangePercent ?? 0,
            learning_speed: Number(enrichedFeatures.learning_speed ?? 50),
            timedAnswerCount: enrichedFeatures.timedAnswerCount ?? 0,
            mastery_score: Number(enrichedFeatures.mastery_score ?? features.average_score ?? 0),
            categoryMastery: enrichedFeatures.categoryMastery ?? [],
            quiz_attempts: Number(features.quiz_attempts ?? 1),
          },
          mlPrediction,
        );

    const prediction = {
      recommendation: adaptiveProfile.recommendation,
      confidence: adaptiveProfile.confidence,
      source: adaptiveProfile.source,
      features: enrichedFeatures,
      adaptiveProfile,
    };

    logger.warn('[ml-recommendation] model unavailable, using adaptive-score fallback', {
      childId,
      error: error instanceof Error ? error.message : String(error),
      adaptiveScore: adaptiveProfile.adaptiveScore,
      features: enrichedFeatures,
    });

    logger.info('[ml-recommendation] prediction', {
      childId,
      source: prediction.source,
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      adaptiveScore: adaptiveProfile.adaptiveScore,
      learnerLevel: adaptiveProfile.learnerLevel,
      features: enrichedFeatures,
    });

    return prediction;
  }
}
