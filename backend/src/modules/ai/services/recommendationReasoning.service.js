/**
 * Build a human-readable summary from hybrid ML + adaptive-score inputs.
 *
 * @param {{
 *   recommendation: 'Easy' | 'Medium' | 'Hard',
 *   confidence?: number,
 *   source?: string,
 *   features?: {
 *     average_score?: number,
 *     quiz_attempts?: number,
 *     completion_rate?: number,
 *     emotional_score?: number | null,
 *     emotional_assessed?: boolean,
 *     performance_trend?: number,
 *     learning_speed?: number,
 *     mastery_score?: number,
 *     trendDirection?: string,
 *     emotional_signal_source?: 'quiz_feedback' | 'sdq_assessment' | 'neutral_default' | string,
 *     quiz_emotion_label?: string | null,
 *   } | null,
 *   adaptiveProfile?: {
 *     adaptiveScore?: number,
 *     learnerLevel?: string,
 *     blend?: { ml: string, adaptive: string } | null,
 *     nextLearningPath?: { focusLabel: string, strategy: string, reason: string },
 *   } | null,
 * }} prediction
 */
export function buildRecommendationReasoning(prediction) {
  const features = prediction.features ?? {};
  const adaptiveProfile = prediction.adaptiveProfile ?? null;
  const averageScore = Number(features.average_score ?? 0);
  const quizAttempts = Number(features.quiz_attempts ?? 0);
  const completionRate = Number(features.completion_rate ?? 0);
  const performanceTrend = Number(features.performance_trend ?? 50);
  const learningSpeed = Number(features.learning_speed ?? 50);
  const masteryScore = Number(features.mastery_score ?? 0);
  const emotionalAssessed = features.emotional_assessed === true;
  const emotionalScore = emotionalAssessed ? Number(features.emotional_score) : null;
  const level = prediction.recommendation;
  const adaptiveScore = adaptiveProfile?.adaptiveScore ?? null;
  const learnerLevel = adaptiveProfile?.learnerLevel ?? null;

  const levelPhrase =
    level === 'Easy'
      ? 'foundational practice to rebuild confidence'
      : level === 'Hard'
        ? 'stretch challenges to advance skills'
        : 'steady practice at your current pace';

  const attemptPhrase =
    quizAttempts <= 1
      ? 'just getting started with quizzes'
      : `${quizAttempts} completed quiz attempts`;

  const scorePhrase =
    averageScore === 0
      ? 'no scored quizzes yet'
      : `${Math.round(averageScore)}% average score`;

  const completionPhrase = `${Math.round(completionRate)}% completion rate`;
  const trendPhrase =
    features.trendDirection === 'improving'
      ? 'improving performance trend'
      : features.trendDirection === 'declining'
        ? 'a recent score dip'
        : 'steady recent performance';
  const speedPhrase =
    learningSpeed >= 65
      ? 'quick, confident answering'
      : learningSpeed <= 40
        ? 'slower response patterns'
        : 'moderate response pace';
  const masteryPhrase =
    masteryScore >= 75
      ? `strong category mastery (${Math.round(masteryScore)}%)`
      : masteryScore > 0
        ? `${Math.round(masteryScore)}% mastery across categories`
        : 'mastery still forming';

  let engineLabel = 'Adaptive learning engine';
  if (prediction.source === 'hybrid_ml_adaptive') {
    engineLabel = 'Hybrid AI model + adaptive score';
  } else if (prediction.source === 'hybrid_rules_adaptive') {
    engineLabel = 'Adaptive score engine (AI model unavailable)';
  } else if (prediction.source === 'model') {
    engineLabel = 'Our AI model';
  } else if (prediction.source === 'adaptive_score') {
    engineLabel = 'Adaptive score engine';
  } else if (prediction.source === 'rules') {
    engineLabel = 'Adaptive score rules';
  }

  const adaptivePhrase =
    adaptiveScore !== null
      ? `Adaptive Score ${Math.round(adaptiveScore)}/100 (${learnerLevel ?? 'learner'})`
      : null;

  const blendPhrase = adaptiveProfile?.blend
    ? `Blended ML tier ${adaptiveProfile.blend.ml} with adaptive tier ${adaptiveProfile.blend.adaptive}.`
    : null;

  const pathPhrase = adaptiveProfile?.nextLearningPath?.reason ?? null;
  const emotionalSource = features.emotional_signal_source ?? 'neutral_default';
  const quizEmotionLabel = features.quiz_emotion_label ?? null;

  const coreMetrics = [
    scorePhrase,
    attemptPhrase,
    completionPhrase,
    trendPhrase,
    speedPhrase,
    masteryPhrase,
  ].join(', ');

  let emotionalPhrase = null;

  if (emotionalSource === 'quiz_feedback' && quizEmotionLabel) {
    if (emotionalScore !== null && emotionalScore <= 40) {
      emotionalPhrase = `the student reported feeling "${quizEmotionLabel}" during a recent quiz, so additional practice is recommended before increasing difficulty`;
    } else if (emotionalScore !== null && emotionalScore >= 80) {
      emotionalPhrase = `the student felt "${quizEmotionLabel}" during a recent quiz, supporting confidence to progress`;
    } else {
      emotionalPhrase = `recent post-quiz feedback was "${quizEmotionLabel}"`;
    }
  } else if (emotionalSource === 'sdq_assessment' && emotionalAssessed) {
    emotionalPhrase =
      emotionalScore >= 70
        ? 'strong emotional readiness from the baseline assessment'
        : emotionalScore >= 50
          ? 'balanced emotional readiness from the baseline assessment'
          : 'the baseline emotional assessment suggests extra support may help';
  } else if (!emotionalAssessed) {
    emotionalPhrase =
      'no quiz emotion feedback or baseline assessment yet (neutral emotional weight applied when skipped)';
  }

  const emotionalSegment = emotionalPhrase ? `${emotionalPhrase}. ` : '';

  return (
    `${engineLabel} recommends ${level} level — ${coreMetrics}. ` +
    emotionalSegment +
    (adaptivePhrase ? `${adaptivePhrase}. ` : '') +
    (blendPhrase ? `${blendPhrase} ` : '') +
    `${level} level suits ${levelPhrase}.` +
    (pathPhrase ? ` Next path: ${pathPhrase}` : '')
  );
}
