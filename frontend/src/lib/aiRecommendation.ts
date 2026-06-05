import type { RecommendedQuiz, TierRecommendation, TierRecommendationFeatures } from '../api/recommendations';

export type DifficultyTier = 'easy' | 'medium' | 'hard';

export type DailyChallengePick = {
    tier: DifficultyTier;
    label: 'Easy' | 'Medium' | 'Hard';
    quiz: RecommendedQuiz | null;
    isRecommended: boolean;
};

const TIER_ORDER: DifficultyTier[] = ['easy', 'medium', 'hard'];

const TIER_LABELS: Record<DifficultyTier, 'Easy' | 'Medium' | 'Hard'> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function formatConfidencePercent(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
}

export function recommendationToTier(level: TierRecommendation['recommendation']): DifficultyTier {
    const map: Record<TierRecommendation['recommendation'], DifficultyTier> = {
        Easy: 'easy',
        Medium: 'medium',
        Hard: 'hard',
    };
    return map[level];
}

function difficultyTarget(tier: DifficultyTier): number {
    if (tier === 'easy') return 1;
    if (tier === 'hard') return 3;
    return 2;
}

function matchesTier(recommendation: RecommendedQuiz, tier: DifficultyTier): boolean {
    const level = recommendation.difficultyLevel ?? recommendation.recommendedDifficulty;
    return level === tier;
}

function sortCandidates(items: RecommendedQuiz[]): RecommendedQuiz[] {
    return [...items].sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.attemptCount - b.attemptCount;
    });
}

function pickChallengeForTier(
    recommendations: RecommendedQuiz[],
    tier: DifficultyTier,
): RecommendedQuiz | null {
    if (recommendations.length === 0) return null;

    const directMatches = recommendations.filter((item) => matchesTier(item, tier));
    if (directMatches.length > 0) {
        return sortCandidates(directMatches)[0];
    }

    const target = difficultyTarget(tier);
    return [...recommendations].sort((a, b) => {
        const aDiff = Math.abs((a.avgDifficulty ?? a.suggestedDifficulty ?? 2) - target);
        const bDiff = Math.abs((b.avgDifficulty ?? b.suggestedDifficulty ?? 2) - target);
        if (aDiff !== bDiff) return aDiff - bDiff;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    })[0];
}

export function buildDailyChallenges(
    recommendations: RecommendedQuiz[],
    tierRecommendation: TierRecommendation | null | undefined,
): DailyChallengePick[] {
    const recommendedTier = tierRecommendation
        ? recommendationToTier(tierRecommendation.recommendation)
        : null;

    return TIER_ORDER.map((tier) => ({
        tier,
        label: TIER_LABELS[tier],
        quiz: pickChallengeForTier(recommendations, tier),
        isRecommended: recommendedTier === tier,
    }));
}

export function isEmotionalAssessed(
    features: TierRecommendationFeatures | null | undefined,
): boolean {
    if (!features) return false;
    if (features.emotional_assessed === false) return false;
    return features.emotional_score !== null && features.emotional_score !== undefined;
}

export function displayReasoningSummary(
    tierRecommendation: TierRecommendation | null | undefined,
): string | null {
    const raw = tierRecommendation?.reasoningSummary?.trim();
    if (!raw) return null;

    if (isEmotionalAssessed(tierRecommendation?.features)) {
        return raw;
    }

    if (raw.toLowerCase().includes('quiz performance only')) {
        return raw;
    }

    return raw
        .replace(/, and (strong|balanced) emotional readiness/gi, '')
        .replace(/, and emotional wellness could use support/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function formatEmotionalFeatureLabel(
    features: TierRecommendationFeatures | null | undefined,
): string {
    if (!features) return 'N/A';
    if (features.emotional_assessed === false) return 'Not assessed';
    if (features.emotional_score === null || features.emotional_score === undefined) {
        return 'Not assessed';
    }
    return `${Math.round(features.emotional_score)}%`;
}

export function sourceLabel(source: TierRecommendation['source']): string {
    if (source === 'model') return 'AI model';
    if (source === 'hybrid_ml_adaptive') return 'Hybrid AI + adaptive score';
    if (source === 'hybrid_rules_adaptive') return 'Adaptive score (ML offline)';
    if (source === 'adaptive_score') return 'Adaptive score engine';
    return 'Adaptive rules';
}

export function formatLearnerLevel(level: string | null | undefined): string {
    if (!level) return 'Unknown';
    return level.charAt(0).toUpperCase() + level.slice(1);
}
