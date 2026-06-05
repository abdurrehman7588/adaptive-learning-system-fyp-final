import { logger } from '../../../shared/utils/logger.js';
import { NEUTRAL_EMOTIONAL_DEFAULT_SCORE } from '../constants/emotionFeedback.constants.js';

/**
 * @typedef {'quiz_feedback' | 'sdq_assessment' | 'neutral_default'} EmotionalSignalSource
 */

/**
 * @typedef {{
 *   score: number | null,
 *   assessed: boolean,
 *   source: EmotionalSignalSource,
 *   label?: string | null,
 *   quizFeedbackAt?: Date | string | null,
 *   assessmentAt?: Date | string | null,
 * }} EmotionalSignal
 */

/**
 * Resolve the emotional signal used by ML + adaptive scoring.
 *
 * Priority (documented for Open House):
 * 1. Latest post-quiz emotion feedback (real-time, attempt-linked)
 * 2. Emotional assessment / SDQ overall score (baseline)
 * 3. Neutral default — score null, assessed false; engines use 50 internally
 *
 * @param {number} childId
 * @param {{
 *   emotionalRepository: import('../../emotional/repositories/emotional.repository.js').EmotionalRepository,
 *   emotionFeedbackRepository: import('../repositories/emotionFeedback.repository.js').EmotionFeedbackRepository,
 * }} deps
 * @returns {Promise<EmotionalSignal>}
 */
export async function resolveEmotionalSignal(childId, deps) {
  try {
    const latestFeedback = await deps.emotionFeedbackRepository.findLatestByChildId(childId);
    if (latestFeedback) {
      return {
        score: Number(latestFeedback.emotionScore),
        assessed: true,
        source: 'quiz_feedback',
        label: latestFeedback.emotionLabel,
        quizFeedbackAt: latestFeedback.createdAt,
      };
    }
  } catch (error) {
    logger.debug('[emotional-signal] quiz feedback unavailable', {
      childId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const latestAssessment = await deps.emotionalRepository.findLatestAssessment(childId);
    if (
      latestAssessment?.overallPercent !== null &&
      latestAssessment?.overallPercent !== undefined
    ) {
      return {
        score: Number(latestAssessment.overallPercent),
        assessed: true,
        source: 'sdq_assessment',
        label: null,
        assessmentAt: latestAssessment.completedAt,
      };
    }
  } catch (error) {
    logger.debug('[emotional-signal] SDQ assessment unavailable', {
      childId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    score: null,
    assessed: false,
    source: 'neutral_default',
    label: null,
  };
}

/**
 * Numeric value for adaptive / ML engines (never null).
 *
 * @param {EmotionalSignal} signal
 */
export function emotionalSignalForComputation(signal) {
  if (signal.assessed && signal.score !== null && signal.score !== undefined) {
    return Number(signal.score);
  }
  return NEUTRAL_EMOTIONAL_DEFAULT_SCORE;
}
