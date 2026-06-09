import {
  buildAdaptiveInsights,
  buildAdaptiveRecommendations,
} from '../../adaptive/adaptiveRecommendations.service.js';
import { buildAdaptiveProfileFromAttempts } from '../../adaptive/adaptiveScore.service.js';
import { buildLearningProfile } from '../../adaptive/learningProfile.service.js';
import { isAdaptiveGrade } from '../../adaptive/adaptiveRules.js';
import {
  difficultyOrdinal,
  gradeLevelToDisplayLabel,
  resolveQuizSubject,
} from '../../../shared/content/taxonomy.js';
import { buildChildAnalytics } from './childAnalytics.service.js';

const WEAK_SUBJECT_THRESHOLD = 70;
const WEAK_QUIZ_THRESHOLD = 60;
const STRONG_SUBJECT_THRESHOLD = 80;

/**
 * Ensure every recommendations bundle carries hybrid adaptive metadata.
 *
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {object | null | undefined} tierPrediction
 */
function resolveEffectiveTierPrediction(attempts, tierPrediction) {
  if (tierPrediction?.adaptiveProfile) {
    return tierPrediction;
  }

  if (tierPrediction) {
    const adaptiveOnly = buildAdaptiveProfileFromAttempts(attempts, null, {
      recommendation: tierPrediction.recommendation,
      confidence: tierPrediction.confidence,
      source: tierPrediction.source ?? 'model',
    });
    return {
      ...tierPrediction,
      adaptiveProfile: adaptiveOnly,
      features: tierPrediction.features ?? adaptiveOnly.features,
    };
  }

  if (attempts.length === 0) return null;

  const adaptiveOnly = buildAdaptiveProfileFromAttempts(attempts, null, null);
  return {
    recommendation: adaptiveOnly.recommendation,
    confidence: adaptiveOnly.confidence,
    source: adaptiveOnly.source,
    features: adaptiveOnly.features,
    adaptiveProfile: adaptiveOnly,
  };
}

/**
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {ReturnType<typeof buildChildAnalytics>} analytics
 */
function buildConceptProfile(analytics, attempts) {
  const completed = attempts.filter((row) => row.status === 'completed');
  const answerRows = [];

  for (const attempt of completed) {
    const { subject, label } = resolveQuizSubject(attempt.quiz ?? {});
    for (const answer of attempt.answers ?? []) {
      answerRows.push({
        key: subject,
        label,
        conceptType: 'topic',
        isCorrect: answer.isCorrect,
      });
    }
  }

  const conceptMap = new Map();
  for (const row of answerRows) {
    const entry = conceptMap.get(row.key) ?? {
      key: row.key,
      label: row.label,
      conceptType: 'topic',
      attempts: 0,
      correctCount: 0,
    };
    entry.attempts += 1;
    if (row.isCorrect) entry.correctCount += 1;
    conceptMap.set(row.key, entry);
  }

  const concepts = [...conceptMap.values()].map((entry) => ({
    ...entry,
    accuracyPercent:
      entry.attempts > 0
        ? Math.round((entry.correctCount / entry.attempts) * 10000) / 100
        : 0,
    avgDifficulty: 1,
  }));

  const weakConcepts = concepts
    .filter((row) => row.attempts >= 2 && row.accuracyPercent < WEAK_SUBJECT_THRESHOLD)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent);

  const masteryConcepts = concepts
    .filter((row) => row.attempts >= 2 && row.accuracyPercent >= STRONG_SUBJECT_THRESHOLD)
    .sort((a, b) => b.accuracyPercent - a.accuracyPercent);

  const recentPercents = completed
    .slice(0, 6)
    .map((row) => {
      if (row.percentage !== null && row.percentage !== undefined) {
        return Number(row.percentage);
      }
      if (row.totalPoints > 0) {
        return (Number(row.score) / Number(row.totalPoints)) * 100;
      }
      return 0;
    });

  const recentAvg =
    recentPercents.length > 0
      ? recentPercents.reduce((s, v) => s + v, 0) / recentPercents.length
      : 0;
  const priorSlice = recentPercents.slice(3, 6);
  const priorAvg =
    priorSlice.length > 0
      ? priorSlice.reduce((s, v) => s + v, 0) / priorSlice.length
      : recentAvg;

  let trend = 'steady';
  if (recentPercents.length >= 4) {
    if (recentAvg - priorAvg >= 5) trend = 'increase';
    else if (priorAvg - recentAvg >= 5) trend = 'decrease';
  }

  const recommendedLevel = recentAvg >= STRONG_SUBJECT_THRESHOLD ? 2 : 1;

  return {
    overallQuestionAccuracy:
      answerRows.length > 0
        ? Math.round(
            (answerRows.filter((r) => r.isCorrect).length / answerRows.length) * 10000,
          ) / 100
        : 0,
    totalQuestionAttempts: answerRows.length,
    weakConcepts,
    masteryConcepts,
    bySkill: [],
    byTopic: concepts,
    difficultyProgression: {
      currentLevel: 1,
      recommendedLevel,
      recentAccuracy: Math.round(recentAvg * 100) / 100,
      trend,
      message:
        recentPercents.length === 0
          ? 'Complete quizzes to unlock difficulty progression hints.'
          : trend === 'increase'
            ? 'Recent scores are improving — try slightly harder quizzes next.'
            : trend === 'decrease'
              ? 'Recent scores dipped — review weak subjects before advancing.'
              : 'Scores are steady — keep practicing recommended quizzes.',
      byDifficulty: [
        {
          difficulty: 1,
          attempts: completed.length,
          correctCount: completed.reduce((s, a) => s + (a.score ?? 0), 0),
          accuracyPercent: Math.round(analytics.summary.averageScorePercent * 100) / 100,
        },
      ],
    },
    learningSpeed: analytics.summary.learningSpeed,
  };
}

/**
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {import('@prisma/client').QuizAttempt[]} attempts
 * @param {ReturnType<typeof buildChildAnalytics>} analytics
 */
function buildRecommendations(quizzes, attempts, analytics) {
  const completed = attempts.filter((row) => row.status === 'completed');
  const attemptsByQuiz = new Map();

  for (const attempt of completed) {
    const list = attemptsByQuiz.get(attempt.quizId) ?? [];
    list.push(attempt);
    attemptsByQuiz.set(attempt.quizId, list);
  }

  const weakestKey = analytics.summary.weakestSubject?.subject;
  const strongestKey = analytics.summary.strongestSubject?.subject;
  const isStrongPerformer =
    analytics.summary.averageScorePercent >= STRONG_SUBJECT_THRESHOLD;
  const recommendations = [];

  for (const quiz of quizzes) {
    const { subject, label, category } = resolveQuizSubject(quiz);
    const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];
    const attemptCount = quizAttempts.length;

    let lastScorePercent = null;
    if (quizAttempts.length > 0) {
      const latest = quizAttempts[0];
      if (latest.percentage !== null && latest.percentage !== undefined) {
        lastScorePercent = Number(latest.percentage);
      } else if (latest.totalPoints > 0) {
        lastScorePercent = Math.round(
          (Number(latest.score) / Number(latest.totalPoints)) * 10000,
        ) / 100;
      }
    }

    let matchType = 'explore';
    let priority = 'medium';
    let reason = 'Explore this quiz to broaden practice.';
    const suggestedDifficulty = difficultyOrdinal(quiz.difficultyLevel ?? 'medium');

    if (attemptCount === 0) {
      matchType = 'unattempted';
      priority = 'medium';
      reason = 'Not attempted yet — good candidate for new practice.';
    } else if (lastScorePercent !== null && lastScorePercent < WEAK_QUIZ_THRESHOLD) {
      matchType = 'weak_subject';
      priority = 'high';
      reason = `Last score was ${Math.round(lastScorePercent)}% — retry to improve.`;
    } else if (subject === weakestKey && (analytics.summary.weakestSubject?.averagePercent ?? 100) < WEAK_SUBJECT_THRESHOLD) {
      matchType = 'weak_subject';
      priority = 'high';
      reason = `${label} is the weakest subject area right now.`;
    } else if (subject === strongestKey && (analytics.summary.strongestSubject?.averagePercent ?? 0) >= STRONG_SUBJECT_THRESHOLD) {
      matchType = 'maintain_strength';
      priority = 'low';
      reason = `Strong performance in ${label} — maintain mastery.`;
    } else if (lastScorePercent !== null && lastScorePercent >= STRONG_SUBJECT_THRESHOLD) {
      matchType = 'maintain_mastery';
      priority = 'low';
      reason = `Recent mastery at ${Math.round(lastScorePercent)}%.`;
    }

    if (
      subject === 'math' &&
      weakestKey === 'math' &&
      (analytics.summary.weakestSubject?.averagePercent ?? 100) < WEAK_SUBJECT_THRESHOLD
    ) {
      matchType = 'weak_subject';
      priority = 'high';
      reason = 'Math needs practice — try this math quiz.';
    } else if (
      subject === 'science' &&
      weakestKey === 'science' &&
      (analytics.summary.weakestSubject?.averagePercent ?? 100) < WEAK_SUBJECT_THRESHOLD
    ) {
      matchType = 'weak_subject';
      priority = 'high';
      reason = 'Science needs practice — try this science quiz.';
    }

    if (isStrongPerformer && attemptCount === 0) {
      matchType = 'advanced';
      priority = 'medium';
      reason = 'Strong overall performance — try this quiz next.';
    } else if (
      isStrongPerformer &&
      lastScorePercent !== null &&
      lastScorePercent >= STRONG_SUBJECT_THRESHOLD
    ) {
      matchType = 'advanced';
      priority = 'low';
      reason = 'You are doing great — keep practicing this quiz.';
    }

    const targetConcepts = [];
    if (matchType === 'weak_subject') {
      targetConcepts.push({
        key: subject,
        label,
        conceptType: 'topic',
        accuracyPercent: analytics.subjectBreakdown.find((s) => s.subject === subject)
          ?.averagePercent,
      });
    }

    recommendations.push({
      quizId: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject,
      subjectLabel: label,
      category: category ?? quiz.category,
      gradeLevel: quiz.gradeLevel,
      gradeLevelLabel: gradeLevelToDisplayLabel(quiz.gradeLevel),
      difficultyLevel: quiz.difficultyLevel,
      timeLimitMinutes: quiz.timeLimitMinutes,
      questionCount: quiz._count?.questions ?? 0,
      suggestedDifficulty,
      avgDifficulty: difficultyOrdinal(quiz.difficultyLevel ?? 'medium'),
      priority,
      matchType,
      targetConcepts,
      reason,
      lastScorePercent,
      attemptCount,
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => {
    const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (diff !== 0) return diff;
    return a.attemptCount - b.attemptCount;
  });
}

/**
 * @param {{
 *   id: number,
 *   name: string,
 *   gradeLevel?: string | null,
 *   attempts: import('@prisma/client').QuizAttempt[],
 * }} child
 * @param {import('@prisma/client').Quiz[]} quizzes
 * @param {{
 *   tierPrediction?: {
 *     recommendation: 'Easy' | 'Medium' | 'Hard',
 *     confidence: number,
 *     source?: string,
 *   } | null,
 * }} [options]
 */
export function buildChildRecommendations(child, quizzes, options = {}) {
  const analytics = buildChildAnalytics(child.attempts);
  const gradeLevel = child.gradeLevel ?? null;
  const tierPrediction = resolveEffectiveTierPrediction(child.attempts, options.tierPrediction);
  const tierPredictionWithSignal = tierPrediction
    ? {
        ...tierPrediction,
        emotionalSignal:
          options.tierPrediction?.emotionalSignal ?? tierPrediction.emotionalSignal ?? null,
      }
    : null;
  const learningProfile = buildLearningProfile(
    child.attempts,
    gradeLevel,
    tierPredictionWithSignal,
  );

  const subjectProfile = {
    overallAverage: analytics.summary.averageScorePercent,
    strongest: analytics.summary.strongestSubject,
    weakest: analytics.summary.weakestSubject,
    subjects: analytics.subjectBreakdown,
    weakSubjects: analytics.subjectBreakdown.filter(
      (row) => row.averagePercent < WEAK_SUBJECT_THRESHOLD,
    ),
  };

  const conceptProfile = buildConceptProfile(analytics, child.attempts);

  const recommendations = isAdaptiveGrade(gradeLevel)
    ? buildAdaptiveRecommendations(learningProfile, quizzes, child.attempts, tierPrediction)
    : buildRecommendations(quizzes, child.attempts, analytics);

  const adaptiveInsights = learningProfile.adaptiveEnabled
    ? buildAdaptiveInsights(learningProfile, recommendations)
    : {
        focusArea: null,
        strongestArea: null,
        whatsNext: null,
        suggestedNextActivity: null,
        weakestCategory: null,
        strongestCategory: null,
      };

  return {
    id: child.id,
    name: child.name,
    gradeLevel,
    subjectProfile,
    learningProfile,
    adaptiveInsights,
    conceptProfile,
    recommendations,
  };
}
