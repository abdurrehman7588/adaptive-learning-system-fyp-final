/**
 * @param {import('@prisma/client').QuizAttempt} attempt
 */
function attemptPercent(attempt) {
  if (attempt.percentage !== null && attempt.percentage !== undefined) {
    return Number(attempt.percentage);
  }
  if (attempt.totalPoints > 0 && attempt.score !== null) {
    return Math.round((Number(attempt.score) / Number(attempt.totalPoints)) * 10000) / 100;
  }
  return 0;
}

/**
 * @param {import('../../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null | undefined} input
 */
function normalizeEmotionalInput(input) {
  if (typeof input === 'number') {
    return {
      score: input,
      assessed: true,
      source: /** @type {'sdq_assessment'} */ ('sdq_assessment'),
      label: null,
    };
  }

  if (input && typeof input === 'object') {
    return input;
  }

  return {
    score: null,
    assessed: false,
    source: /** @type {'neutral_default'} */ ('neutral_default'),
    label: null,
  };
}

/**
 * Build ML feature vector from learner activity.
 *
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {import('../../emotion-feedback/services/emotionalSignal.service.js').EmotionalSignal | number | null} [emotionalInput]
 * @returns {{
 *   average_score: number,
 *   quiz_attempts: number,
 *   completion_rate: number,
 *   emotional_score: number | null,
 *   emotional_assessed: boolean,
 *   emotional_signal_source: string,
 *   quiz_emotion_label: string | null,
 * }}
 */
export function buildStudentFeatures(attempts, emotionalInput = null) {
  const signal = normalizeEmotionalInput(emotionalInput);
  const completed = attempts.filter((row) => row.status === 'completed');
  const totalAttempts = attempts.length;

  let average_score = 0;
  if (completed.length > 0) {
    const sum = completed.reduce((acc, attempt) => acc + attemptPercent(attempt), 0);
    average_score = Math.round((sum / completed.length) * 100) / 100;
  }

  const quiz_attempts = Math.min(20, Math.max(1, completed.length || 1));

  const completion_rate =
    totalAttempts > 0
      ? Math.round((completed.length / totalAttempts) * 10000) / 100
      : 0;

  const emotional_assessed = signal.assessed === true;
  const emotional_score = emotional_assessed
    ? Math.round(Number(signal.score) * 100) / 100
    : null;

  return {
    average_score,
    quiz_attempts,
    completion_rate,
    emotional_score,
    emotional_assessed,
    emotional_signal_source: signal.source,
    quiz_emotion_label: signal.label ?? null,
  };
}

/** Neutral default used only for ML inference when no assessment exists. */
export const ML_EMOTIONAL_SCORE_DEFAULT = 50;

/**
 * Merge ML display features with extended adaptive-engine features.
 *
 * @param {ReturnType<typeof buildStudentFeatures>} mlFeatures
 * @param {ReturnType<import('../../adaptive/adaptiveScore.service.js').buildAdaptiveFeatures>} adaptiveFeatures
 */
export function mergeAdaptiveFeatures(mlFeatures, adaptiveFeatures) {
  return {
    ...mlFeatures,
    performance_trend: adaptiveFeatures.performance_trend,
    trendDirection: adaptiveFeatures.trendDirection,
    trendChangePercent: adaptiveFeatures.trendChangePercent,
    learning_speed: adaptiveFeatures.learning_speed,
    mastery_score: adaptiveFeatures.mastery_score,
    categoryMastery: adaptiveFeatures.categoryMastery,
    timedAnswerCount: adaptiveFeatures.timedAnswerCount,
    emotional_signal_source: adaptiveFeatures.emotional_signal_source,
    quiz_emotion_label: adaptiveFeatures.quiz_emotion_label,
  };
}

/**
 * Map display features to the numeric vector expected by the Python model.
 *
 * @param {ReturnType<typeof buildStudentFeatures>} features
 */
export function toModelInputFeatures(features) {
  return {
    average_score: features.average_score,
    quiz_attempts: features.quiz_attempts,
    completion_rate: features.completion_rate,
    emotional_score:
      features.emotional_score !== null && features.emotional_score !== undefined
        ? features.emotional_score
        : ML_EMOTIONAL_SCORE_DEFAULT,
  };
}
