import { resolveQuizSubject } from '../utils/subject.js';
import { buildLearningSpeedInsights } from '../utils/learningSpeed.js';

const RECENT_HISTORY_LIMIT = 12;
const WEEKLY_DAYS = 7;

function toPercent(attempt) {
  if (attempt.percentage !== null && attempt.percentage !== undefined) {
    return Number(attempt.percentage);
  }
  if (attempt.totalPoints > 0 && attempt.score !== null) {
    return Math.round((Number(attempt.score) / Number(attempt.totalPoints)) * 10000) / 100;
  }
  return 0;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatIsoDate(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

/**
 * @param {Array<{ averagePercent: number, attempts: number }>} weeklyProgress
 */
function buildPerformanceTrend(weeklyProgress) {
  const withData = weeklyProgress.filter((point) => point.attempts > 0);

  if (withData.length < 2) {
    return {
      direction: 'stable',
      changePercent: 0,
      label: 'Complete more quizzes to see a performance trend.',
    };
  }

  const midpoint = Math.floor(withData.length / 2);
  const earlier = withData.slice(0, midpoint);
  const later = withData.slice(midpoint);

  const avgEarlier =
    earlier.reduce((sum, point) => sum + point.averagePercent, 0) / earlier.length;
  const avgLater =
    later.reduce((sum, point) => sum + point.averagePercent, 0) / later.length;
  const changePercent = Math.round((avgLater - avgEarlier) * 100) / 100;

  if (changePercent >= 5) {
    return {
      direction: 'improving',
      changePercent,
      label: 'Scores are trending up this week.',
    };
  }

  if (changePercent <= -5) {
    return {
      direction: 'declining',
      changePercent,
      label: 'Scores dipped recently — extra practice may help.',
    };
  }

  return {
    direction: 'stable',
    changePercent,
    label: 'Performance is steady this week.',
  };
}

/**
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 */
export function buildChildAnalytics(attempts) {
  const completed = attempts.filter((row) => row.status === 'completed');
  const totalAttempts = attempts.length;
  const completedAttempts = completed.length;

  const percentages = completed.map(toPercent);
  const averageScorePercent =
    percentages.length > 0
      ? Math.round(
          (percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 100,
        ) / 100
      : 0;

  const rawScores = completed.map((attempt) => Number(attempt.score ?? 0));
  const averageScore =
    rawScores.length > 0
      ? Math.round(
          (rawScores.reduce((sum, value) => sum + value, 0) / rawScores.length) * 100,
        ) / 100
      : 0;

  const subjectMap = new Map();

  for (const attempt of completed) {
    const { subject, label } = resolveQuizSubject(attempt.quiz ?? {});
    const entry = subjectMap.get(subject) ?? {
      subject,
      label,
      attempts: 0,
      totalPercent: 0,
    };
    entry.attempts += 1;
    entry.totalPercent += toPercent(attempt);
    subjectMap.set(subject, entry);
  }

  const subjectBreakdown = [...subjectMap.values()]
    .map((entry) => ({
      subject: entry.subject,
      label: entry.label,
      attempts: entry.attempts,
      averagePercent:
        entry.attempts > 0
          ? Math.round((entry.totalPercent / entry.attempts) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.averagePercent - a.averagePercent);

  const strongestSubject =
    subjectBreakdown.length > 0
      ? subjectBreakdown.reduce((best, row) =>
          row.averagePercent > best.averagePercent ? row : best,
        )
      : null;

  const weakestSubject =
    subjectBreakdown.length > 0
      ? subjectBreakdown.reduce((worst, row) =>
          row.averagePercent < worst.averagePercent ? row : worst,
        )
      : null;

  const now = startOfDay(new Date());
  const weeklyBuckets = [];

  for (let offset = WEEKLY_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(day.getDate() - offset);
    weeklyBuckets.push({
      date: formatIsoDate(day),
      label: formatDayLabel(day),
      totalPercent: 0,
      attempts: 0,
    });
  }

  const bucketIndex = new Map(weeklyBuckets.map((row, index) => [row.date, index]));

  const subjectDailyMap = new Map();

  for (const attempt of completed) {
    const completedAt = attempt.completedAt ?? attempt.startedAt;
    const dayKey = formatIsoDate(completedAt);
    const percent = toPercent(attempt);
    const bucketIdx = bucketIndex.get(dayKey);

    if (bucketIdx !== undefined) {
      weeklyBuckets[bucketIdx].totalPercent += percent;
      weeklyBuckets[bucketIdx].attempts += 1;
    }

    const { subject, label } = resolveQuizSubject(attempt.quiz ?? {});
    const trendKey = `${dayKey}:${subject}`;
    const trendEntry = subjectDailyMap.get(trendKey) ?? {
      date: dayKey,
      subject,
      subjectLabel: label,
      totalPercent: 0,
      attempts: 0,
    };
    trendEntry.totalPercent += percent;
    trendEntry.attempts += 1;
    subjectDailyMap.set(trendKey, trendEntry);
  }

  const weeklyProgress = weeklyBuckets.map((row) => ({
    date: row.date,
    label: row.label,
    averagePercent:
      row.attempts > 0 ? Math.round((row.totalPercent / row.attempts) * 100) / 100 : 0,
    attempts: row.attempts,
  }));

  const subjectDailyTrends = [...subjectDailyMap.values()]
    .map((row) => ({
      date: row.date,
      subject: row.subject,
      subjectLabel: row.subjectLabel,
      averagePercent:
        row.attempts > 0
          ? Math.round((row.totalPercent / row.attempts) * 100) / 100
          : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const timingRows = [];
  for (const attempt of completed) {
    const { label } = resolveQuizSubject(attempt.quiz ?? {});
    for (const answer of attempt.answers ?? []) {
      timingRows.push({
        isCorrect: answer.isCorrect,
        timeTakenSeconds: answer.timeTakenSeconds,
        subjectLabel: label,
      });
    }
  }

  const learningSpeed = buildLearningSpeedInsights(timingRows);

  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - WEEKLY_DAYS);
  const priorCutoff = new Date(recentCutoff);
  priorCutoff.setDate(priorCutoff.getDate() - WEEKLY_DAYS);

  let recentSeconds = 0;
  let priorSeconds = 0;

  for (const attempt of completed) {
    const completedAt = new Date(attempt.completedAt ?? attempt.startedAt);
    for (const answer of attempt.answers ?? []) {
      if (answer.timeTakenSeconds === null || answer.timeTakenSeconds === undefined) {
        continue;
      }
      if (completedAt >= recentCutoff) {
        recentSeconds += answer.timeTakenSeconds;
      } else if (completedAt >= priorCutoff) {
        priorSeconds += answer.timeTakenSeconds;
      }
    }
  }

  if (recentSeconds === 0 && priorSeconds === 0) {
    recentSeconds = learningSpeed.totalStudyTimeSeconds;
  }

  const recentHistory = completed
    .slice()
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime(),
    )
    .slice(0, RECENT_HISTORY_LIMIT)
    .map((attempt) => {
      const { subject, label } = resolveQuizSubject(attempt.quiz ?? {});
      return {
        attemptId: attempt.id,
        quizId: attempt.quizId,
        quizTitle: attempt.quiz?.title ?? 'Quiz',
        subject,
        subjectLabel: label,
        score: attempt.score ?? 0,
        totalPoints: attempt.totalPoints ?? attempt.quiz?._count?.questions ?? 0,
        percentage: toPercent(attempt),
        completedAt: (attempt.completedAt ?? attempt.startedAt).toISOString(),
      };
    });

  const performanceTrend = buildPerformanceTrend(weeklyProgress);
  const lastActivityAt =
    recentHistory.length > 0 ? recentHistory[0].completedAt : null;

  return {
    summary: {
      totalAttempts,
      completedAttempts,
      averageScore,
      averageScorePercent,
      averagePercentage: averageScorePercent,
      strongestSubject,
      weakestSubject,
      performanceTrend,
      lastActivityAt,
      learningSpeed,
    },
    performanceTrend,
    subjectBreakdown,
    weeklyProgress,
    subjectDailyTrends,
    studyTimeComparison: {
      recentSeconds,
      priorSeconds,
    },
    recentHistory,
  };
}

/**
 * @param {Array<{
 *   id: number,
 *   name: string,
 *   gradeLevel?: string | null,
 *   attempts: import('@prisma/client').QuizAttempt[],
 * }>} childrenRows
 */
export function buildParentAnalyticsOverview(childrenRows) {
  const children = childrenRows.map((child) => ({
    id: child.id,
    name: child.name,
    gradeLevel: child.gradeLevel ?? null,
    ...buildChildAnalytics(child.attempts),
  }));

  const allAttempts = childrenRows.flatMap((child) => child.attempts);
  const allCompleted = allAttempts.filter((row) => row.status === 'completed');
  const percentages = allCompleted.map(toPercent);

  const rawScores = allCompleted.map((attempt) => Number(attempt.score ?? 0));
  const averageScorePercent =
    percentages.length > 0
      ? Math.round(
          (percentages.reduce((sum, value) => sum + value, 0) / percentages.length) * 100,
        ) / 100
      : 0;

  const allWeekly = children.flatMap((child) => child.weeklyProgress ?? []);
  const performanceTrend = buildPerformanceTrend(allWeekly);

  const lastActivityAt = children
    .map((child) => child.summary?.lastActivityAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  return {
    summary: {
      childCount: childrenRows.length,
      totalAttempts: allAttempts.length,
      completedAttempts: allCompleted.length,
      averageScore:
        rawScores.length > 0
          ? Math.round(
              (rawScores.reduce((sum, value) => sum + value, 0) / rawScores.length) * 100,
            ) / 100
          : 0,
      averageScorePercent,
      averagePercentage: averageScorePercent,
      performanceTrend,
      lastActivityAt,
    },
    children,
  };
}
