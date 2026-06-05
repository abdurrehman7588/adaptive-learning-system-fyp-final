import {
  ACTIVITY_BY_DIMENSION,
  EI_ACTIVITIES,
  EI_CATEGORY_DESCRIPTIONS,
  EI_CATEGORY_EXPLANATIONS,
  EI_DIMENSION_LABELS,
  EI_DIMENSION_ROUTE_SLUGS,
  EI_DIMENSIONS,
  EI_FEELING_OPTIONS,
  EI_QUESTIONS,
  EI_REASON_OPTIONS,
  EI_SCALE,
  XP_EI_ACTIVITY,
} from '../constants/eiCatalog.js';
import { computeFeelingsJournalInsights } from '../services/feelingsInsights.service.js';
import { scoreAssessment, strongestWeakest } from '../services/emotionalScoring.service.js';

const ROUTE_SLUG_BY_DIMENSION = Object.fromEntries(
  Object.entries(EI_DIMENSION_ROUTE_SLUGS).map(([route, dimension]) => [dimension, route]),
);

/**
 * @param {import('@prisma/client').EmotionalAssessment | null} assessment
 * @param {Array<{ payload: unknown }>} [feelingsCompletions]
 */
const EI_SCHEMA_UNAVAILABLE_MESSAGE =
  'Emotional intelligence data is not available on this server yet. Database migrations are pending.';

/** Profile payload when EI tables are missing (avoids 500s on read paths). */
export function toUnavailableProfileDto(
  message = EI_SCHEMA_UNAVAILABLE_MESSAGE,
) {
  const base = toProfileDto(null, []);
  return {
    ...base,
    schemaStatus: 'unavailable',
    schemaMessage: message,
  };
}

export function toProfileDto(assessment, feelingsCompletions = []) {
  const recommendedSlug = resolveRecommendedSlug(assessment);
  const activities = buildActivitiesList(recommendedSlug);
  const feelingsInsights = computeFeelingsJournalInsights(feelingsCompletions);

  if (!assessment) {
    return {
      schemaStatus: 'ready',
      hasAssessment: false,
      questionnaire: buildQuestionnaireDto(),
      categories: null,
      overallScore: null,
      overallStatus: null,
      strongestArea: null,
      weakestArea: null,
      recommendedActivity: activities.find((a) => a.isRecommended) ?? activities[0],
      recommendedActivitySlug: recommendedSlug,
      activities,
      feelingsOptions: EI_FEELING_OPTIONS,
      reasonOptions: EI_REASON_OPTIONS,
      feelingsInsights,
      lastCompletedAt: null,
    };
  }

  const percents = {
    self_awareness: Number(assessment.selfAwarenessPercent),
    empathy: Number(assessment.empathyPercent),
    self_regulation: Number(assessment.selfRegulationPercent),
  };

  const { strongest, weakest } = strongestWeakest(percents);

  return {
    schemaStatus: 'ready',
    hasAssessment: true,
    questionnaire: buildQuestionnaireDto(),
    categories: buildCategoriesDto(assessment, percents),
    overallScore: Number(assessment.overallPercent),
    overallStatus: statusLabelFromOverall(Number(assessment.overallPercent)),
    strongestArea: {
      dimension: strongest,
      label: EI_DIMENSION_LABELS[strongest],
      percent: percents[strongest],
    },
    weakestArea: {
      dimension: weakest,
      label: EI_DIMENSION_LABELS[weakest],
      percent: percents[weakest],
    },
    recommendedActivity:
      activities.find((a) => a.slug === recommendedSlug) ??
      recommendActivity(assessment),
    recommendedActivitySlug: recommendedSlug,
    activities,
    feelingsOptions: EI_FEELING_OPTIONS,
    reasonOptions: EI_REASON_OPTIONS,
    feelingsInsights,
    lastCompletedAt: assessment.completedAt.toISOString(),
  };
}

/**
 * @param {import('@prisma/client').EmotionalAssessment} assessment
 * @param {Record<string, number>} percents
 */
function buildCategoriesDto(assessment, percents) {
  /** @type {Record<string, object>} */
  const categories = {};

  for (const dimension of EI_DIMENSIONS) {
    const statusKey =
      dimension === 'self_awareness'
        ? 'selfAwarenessStatus'
        : dimension === 'empathy'
          ? 'empathyStatus'
          : 'selfRegulationStatus';

    categories[dimension] = {
      label: EI_DIMENSION_LABELS[dimension],
      percent: percents[dimension],
      status: assessment[statusKey],
      description: EI_CATEGORY_DESCRIPTIONS[dimension],
      explanation: EI_CATEGORY_EXPLANATIONS[dimension],
      routeSlug: ROUTE_SLUG_BY_DIMENSION[dimension],
      relatedActivitySlug: ACTIVITY_BY_DIMENSION[dimension],
    };
  }

  return categories;
}

/**
 * @param {import('@prisma/client').EmotionalAssessment | null} assessment
 */
function resolveRecommendedSlug(assessment) {
  if (!assessment) return 'feelings_today';

  const percents = {
    self_awareness: Number(assessment.selfAwarenessPercent),
    empathy: Number(assessment.empathyPercent),
    self_regulation: Number(assessment.selfRegulationPercent),
  };
  const { weakest } = strongestWeakest(percents);
  return ACTIVITY_BY_DIMENSION[weakest];
}

/**
 * @param {string} recommendedSlug
 */
function buildActivitiesList(recommendedSlug) {
  return Object.values(EI_ACTIVITIES).map((activity) => {
    const dto = activityToDto(
      activity,
      activity.slug === recommendedSlug
        ? `Practice your ${EI_DIMENSION_LABELS[activity.dimension]} skills.`
        : `Build your ${EI_DIMENSION_LABELS[activity.dimension]} skills.`,
    );
    return {
      ...dto,
      isRecommended: activity.slug === recommendedSlug,
    };
  });
}

function statusLabelFromOverall(percent) {
  if (percent < 50) return 'developing';
  if (percent < 75) return 'good';
  return 'strong';
}

/**
 * @param {import('@prisma/client').EmotionalAssessment | null} assessment
 */
function recommendActivity(assessment) {
  const slug = resolveRecommendedSlug(assessment);
  const activity = EI_ACTIVITIES[slug];
  const reason = assessment
    ? `Your ${EI_DIMENSION_LABELS[activity.dimension]} area could use practice — try this activity.`
    : 'Start with a feelings check-in.';
  return activityToDto(activity, reason);
}

function activityToDto(activity, reason) {
  return {
    slug: activity.slug,
    title: activity.title,
    description: activity.description,
    dimension: activity.dimension,
    dimensionLabel: EI_DIMENSION_LABELS[activity.dimension],
    type: activity.type,
    reason,
    ...(activity.type === 'feelings_journal'
      ? {
          feelings: activity.feelings,
          reasons: activity.reasons,
        }
      : {
          scenario: activity.scenario,
          options: activity.options,
        }),
  };
}

export function buildQuestionnaireDto() {
  return {
    scale: EI_SCALE,
    dimensions: EI_DIMENSIONS.map((dimension) => ({
      dimension,
      label: EI_DIMENSION_LABELS[dimension],
      questions: EI_QUESTIONS[dimension].map((text, questionIndex) => ({
        dimension,
        questionIndex,
        text,
      })),
    })),
  };
}

/**
 * @param {import('@prisma/client').EmotionalAssessment} assessment
 * @param {Array<{ payload: unknown }>} [feelingsCompletions]
 */
export function toAssessmentResultDto(assessment, feelingsCompletions = []) {
  return {
    assessmentId: assessment.id,
    completedAt: assessment.completedAt.toISOString(),
    profile: toProfileDto(assessment, feelingsCompletions),
  };
}

/**
 * @param {import('@prisma/client').EmotionalAssessment[]} rows
 */
export function toHistoryDto(rows) {
  return rows.map((row) => ({
    assessmentId: row.id,
    completedAt: row.completedAt.toISOString(),
    overallScore: Number(row.overallPercent),
    categories: {
      self_awareness: Number(row.selfAwarenessPercent),
      empathy: Number(row.empathyPercent),
      self_regulation: Number(row.selfRegulationPercent),
    },
  }));
}

export function toActivityCompletionDto(completion, correct) {
  return {
    success: correct !== false,
    xpAwarded: completion.xpAwarded,
    activitySlug: completion.activitySlug,
    completedAt: completion.completedAt.toISOString(),
    message:
      completion.xpAwarded > 0
        ? `Great job! You earned ${completion.xpAwarded} XP.`
        : 'Activity saved. Try again for full XP on scenario activities.',
  };
}

export { XP_EI_ACTIVITY, EI_DIMENSION_ROUTE_SLUGS };
