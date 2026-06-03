import { isAxiosError } from 'axios';
import { getAuthRoleFromToken } from '../lib/jwtSession';
import { apiClient } from './client';
import type { LearningSpeedInsights, SubjectStat } from './analytics';

export type RecommendationMatchType =
    | 'weak_subject'
    | 'weak_concept'
    | 'unattempted'
    | 'explore'
    | 'maintain_strength'
    | 'maintain_mastery'
    | 'difficulty_progression'
    | 'retry'
    | 'practice'
    | 'challenge';

export type CategoryStatus =
    | 'needs_practice'
    | 'progressing'
    | 'mastery'
    | 'unattempted';

export type AdaptiveAction = 'retry' | 'practice' | 'challenge' | 'explore';

export type CategoryInsight = {
    category: string;
    label: string;
    averagePercent: number | null;
    status: CategoryStatus;
};

export type LearningCategoryStat = CategoryInsight & {
    attemptCount: number;
    recommendedDifficulty: string;
};

export type LearningProfile = {
    adaptiveEnabled: boolean;
    categories: LearningCategoryStat[];
    weakest: CategoryInsight | null;
    strongest: CategoryInsight | null;
};

export type AdaptiveNextStep = {
    quizId: number;
    title: string;
    category: string;
    label: string;
    reason: string;
    adaptiveAction: AdaptiveAction;
    priority: 'high' | 'medium' | 'low';
    recommendedDifficulty: string;
};

export type AdaptiveInsights = {
    focusArea: CategoryInsight | null;
    strongestArea: CategoryInsight | null;
    whatsNext: AdaptiveNextStep | null;
    suggestedNextActivity: AdaptiveNextStep | null;
    weakestCategory: CategoryInsight | null;
    strongestCategory: CategoryInsight | null;
};

export type TargetConcept = {
    key: string;
    label: string;
    conceptType: 'skill_tag' | 'topic';
    accuracyPercent?: number;
    matchingQuestions?: number;
};

export type RecommendedQuiz = {
    quizId: number;
    title: string;
    description?: string | null;
    subject: string;
    subjectLabel: string;
    category?: string;
    categoryLabel?: string;
    categoryStatus?: CategoryStatus;
    adaptiveAction?: AdaptiveAction;
    recommendedDifficulty?: string;
    recommendedDifficultyLabel?: string;
    gradeLevel?: string | null;
    timeLimitMinutes?: number | null;
    questionCount: number;
    suggestedDifficulty: number;
    avgDifficulty?: number;
    priority: 'high' | 'medium' | 'low';
    matchType: RecommendationMatchType;
    targetConcepts: TargetConcept[];
    reason: string;
    lastScorePercent?: number | null;
    attemptCount: number;
};

export type ConceptStat = {
    key: string;
    label: string;
    conceptType: 'skill_tag' | 'topic';
    attempts: number;
    correctCount: number;
    accuracyPercent: number;
    avgDifficulty: number;
};

export type DifficultyBand = {
    difficulty: number;
    attempts: number;
    correctCount: number;
    accuracyPercent: number;
};

export type DifficultyProgression = {
    currentLevel: number;
    recommendedLevel: number;
    recentAccuracy: number;
    trend: 'increase' | 'decrease' | 'steady';
    message: string;
    byDifficulty: DifficultyBand[];
};

export type ConceptProfile = {
    overallQuestionAccuracy: number;
    totalQuestionAttempts: number;
    weakConcepts: ConceptStat[];
    masteryConcepts: ConceptStat[];
    bySkill: ConceptStat[];
    byTopic: ConceptStat[];
    difficultyProgression: DifficultyProgression;
    learningSpeed: LearningSpeedInsights;
};

export type SubjectProfile = {
    overallAverage: number;
    strongest: SubjectStat | null;
    weakest: SubjectStat | null;
    subjects: SubjectStat[];
    weakSubjects: SubjectStat[];
};

export type ChildRecommendations = {
    id: number;
    name: string;
    gradeLevel?: string | null;
    subjectProfile: SubjectProfile;
    learningProfile?: LearningProfile;
    adaptiveInsights?: AdaptiveInsights;
    conceptProfile: ConceptProfile;
    recommendations: RecommendedQuiz[];
};

export type ParentRecommendationsOverview = {
    children: ChildRecommendations[];
};

export async function fetchParentRecommendationsOverview(): Promise<ParentRecommendationsOverview> {
    const { data } = await apiClient.get<{ overview: ParentRecommendationsOverview }>(
        '/children/recommendations/overview',
    );
    return data.overview;
}

export type LearnerRecommendationsBundle = {
    child: { id: number; name: string; gradeLevel?: string | null; gradeLevelLabel?: string | null };
    subjectProfile: SubjectProfile;
    learningProfile?: LearningProfile;
    adaptiveInsights?: AdaptiveInsights;
    conceptProfile: ConceptProfile;
    recommendations: RecommendedQuiz[];
};

export async function fetchChildRecommendations(childId: number): Promise<LearnerRecommendationsBundle> {
    const { data } = await apiClient.get<LearnerRecommendationsBundle>(
        `/children/${childId}/recommendations`,
    );
    return data;
}

/** Student session — uses JWT child id via /children/me/recommendations. */
export async function fetchStudentRecommendations(): Promise<LearnerRecommendationsBundle> {
    const { data } = await apiClient.get<LearnerRecommendationsBundle>(
        '/children/me/recommendations',
    );
    return data;
}

/**
 * Parent: by child id. Student: /me (strict JWT grade scope).
 */
export async function fetchLearnerRecommendations(
    childId?: number,
): Promise<LearnerRecommendationsBundle> {
    if (getAuthRoleFromToken() === 'student') {
        return fetchStudentRecommendations();
    }
    if (!childId) {
        throw new Error('Child id is required for parent recommendation requests.');
    }
    return fetchChildRecommendations(childId);
}

export function getRecommendationsErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
        if (error.response?.status === 404) {
            return 'Recommendations API not found. Restart the backend server, then refresh.';
        }
        if (error.response?.status === 401) {
            return 'Please sign in with a parent account to view recommendations.';
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not load recommendations. Please try again.';
}

export function subjectToQuizType(subject: string): 'cognitive' | 'iq' | 'gk' {
    const lower = subject.toLowerCase();
    if (lower.includes('iq') || lower.includes('logic')) return 'iq';
    if (lower.includes('gk') || lower.includes('general') || lower.includes('world')) {
        return 'gk';
    }
    return 'cognitive';
}
