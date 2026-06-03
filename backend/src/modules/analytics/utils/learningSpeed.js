const FAST_THRESHOLD = 25;
const SLOW_THRESHOLD = 45;

/**
 * @param {Array<{
 *   isCorrect: boolean,
 *   timeTakenSeconds: number | null,
 *   subjectLabel: string,
 * }>} rows
 */
export function buildLearningSpeedInsights(rows) {
  const signals = {
    strong_understanding: 0,
    needs_practice: 0,
    weak_concept: 0,
    quick_miss: 0,
    steady_correct: 0,
    needs_review: 0,
    untracked: 0,
  };

  const weakByLabel = new Map();
  let timedCount = 0;
  let totalSeconds = 0;

  for (const row of rows) {
    const seconds = row.timeTakenSeconds;
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
      signals.untracked += 1;
      continue;
    }

    timedCount += 1;
    totalSeconds += seconds;

    const isCorrect = Boolean(row.isCorrect);
    const isFast = seconds < FAST_THRESHOLD;
    const isSlow = seconds > SLOW_THRESHOLD;

    if (isCorrect && isFast) {
      signals.strong_understanding += 1;
    } else if (isCorrect && isSlow) {
      signals.steady_correct += 1;
    } else if (!isCorrect && isFast) {
      signals.quick_miss += 1;
    } else if (!isCorrect && isSlow) {
      signals.weak_concept += 1;
      const label = row.subjectLabel || 'Mixed';
      weakByLabel.set(label, (weakByLabel.get(label) ?? 0) + 1);
    } else if (!isCorrect) {
      signals.needs_practice += 1;
    } else {
      signals.needs_review += 1;
    }
  }

  const weakConceptsFromTiming = [...weakByLabel.entries()]
    .map(([label, count]) => ({ key: label.toLowerCase().replace(/\s+/g, '_'), label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  let summaryMessage =
    'Complete a timed quiz to see how quickly your child answers each question.';
  if (timedCount > 0) {
    const avg = Math.round(totalSeconds / timedCount);
    if (signals.weak_concept > 0) {
      summaryMessage = `Some answers were slow and incorrect (avg ${avg}s per question). Extra practice on weak areas is recommended.`;
    } else if (signals.strong_understanding > signals.quick_miss) {
      summaryMessage = `Strong pace on correct answers (avg ${avg}s). Keep building momentum.`;
    } else {
      summaryMessage = `Average response time is ${avg}s across ${timedCount} timed answers.`;
    }
  }

  return {
    timedAnswerCount: timedCount,
    averageResponseSeconds: timedCount > 0 ? Math.round(totalSeconds / timedCount) : 0,
    totalStudyTimeSeconds: totalSeconds,
    fastThresholdSeconds: FAST_THRESHOLD,
    slowThresholdSeconds: SLOW_THRESHOLD,
    signals,
    weakConceptsFromTiming,
    summaryMessage,
  };
}
