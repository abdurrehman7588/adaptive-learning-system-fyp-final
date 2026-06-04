import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type EmotionalDimension = 'self_awareness' | 'empathy' | 'self_regulation';
export type EmotionalScoreStatus = 'developing' | 'good' | 'strong';
export type EIReason = 'School' | 'Friends' | 'Family' | 'Games' | 'Other';
export type EIFeeling = 'Happy' | 'Sad' | 'Angry' | 'Worried';

export type EIScaleOption = { value: number; label: string };

export type EIQuestion = {
    dimension: EmotionalDimension;
    questionIndex: number;
    text: string;
};

export type EIQuestionnaireDimension = {
    dimension: EmotionalDimension;
    label: string;
    questions: EIQuestion[];
};

export type EIQuestionnaire = {
    scale: EIScaleOption[];
    dimensions: EIQuestionnaireDimension[];
};

export type EICategoryScore = {
    label: string;
    percent: number;
    status: EmotionalScoreStatus;
    description: string;
    explanation: string;
    routeSlug: string;
    relatedActivitySlug: string;
};

export type EIOption = { value: string; emoji: string; label: string };

export type EIActivity = {
    slug: string;
    title: string;
    description: string;
    dimension: EmotionalDimension;
    dimensionLabel: string;
    type: 'feelings_journal' | 'scenario';
    reason: string;
    isRecommended: boolean;
    feelings?: string[];
    reasons?: EIReason[];
    scenario?: string;
    options?: Array<{ key: string; label: string }>;
};

export type FeelingsInsights = {
    mostCommonEmotion: string;
    mostCommonReason: string | null;
    entryCount: number;
};

export type EmotionalProfile = {
    hasAssessment: boolean;
    questionnaire: EIQuestionnaire;
    categories: Record<EmotionalDimension, EICategoryScore> | null;
    overallScore: number | null;
    overallStatus: EmotionalScoreStatus | null;
    strongestArea: { dimension: EmotionalDimension; label: string; percent: number } | null;
    weakestArea: { dimension: EmotionalDimension; label: string; percent: number } | null;
    recommendedActivity: EIActivity;
    recommendedActivitySlug: string;
    activities: EIActivity[];
    feelingsOptions: EIOption[];
    reasonOptions: EIOption[];
    feelingsInsights: FeelingsInsights | null;
    lastCompletedAt: string | null;
};

export type AssessmentResponse = {
    dimension: EmotionalDimension;
    questionIndex: number;
    value: number;
};

export type EmotionalHistoryEntry = {
    assessmentId: number;
    completedAt: string;
    overallScore: number;
    categories: Record<EmotionalDimension, number>;
};

export type ActivityCompletionResult = {
    success: boolean;
    xpAwarded: number;
    activitySlug: string;
    completedAt: string;
    message: string;
};

export async function fetchMyEmotionalProfile(): Promise<EmotionalProfile> {
    const { data } = await apiClient.get<EmotionalProfile>('/children/me/emotional-profile');
    return data;
}

export async function fetchChildEmotionalProfile(childId: number): Promise<EmotionalProfile> {
    const { data } = await apiClient.get<EmotionalProfile>(
        `/children/${childId}/emotional-profile`,
    );
    return data;
}

export async function fetchMyEmotionalHistory(): Promise<{ history: EmotionalHistoryEntry[] }> {
    const { data } = await apiClient.get<{ history: EmotionalHistoryEntry[] }>(
        '/children/me/emotional-history',
    );
    return data;
}

export async function submitEmotionalAssessment(responses: AssessmentResponse[]): Promise<{
    assessmentId: number;
    completedAt: string;
    profile: EmotionalProfile;
}> {
    const { data } = await apiClient.post('/children/me/emotional-assessment', { responses });
    return data;
}

export async function completeEmotionalActivity(
    slug: string,
    body: { feeling: EIFeeling; reason: EIReason } | { answer: string },
): Promise<ActivityCompletionResult> {
    const { data } = await apiClient.post<ActivityCompletionResult>(
        `/children/me/emotional-activities/${slug}/complete`,
        body,
    );
    return data;
}

export function statusLabel(status: EmotionalScoreStatus | null | undefined): string {
    if (!status) return '—';
    if (status === 'developing') return 'Developing';
    if (status === 'good') return 'Good';
    return 'Strong';
}

export function statusColor(status: EmotionalScoreStatus | null | undefined): string {
    if (status === 'strong') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'good') return 'text-sky-600 bg-sky-50 border-sky-200';
    if (status === 'developing') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
}

export type AssessmentCategoryProgress = 'not_started' | 'in_progress' | 'complete';

export function assessmentCategoryProgressLabel(
    answered: number,
    total: number,
): { status: AssessmentCategoryProgress; label: string; colorClass: string } {
    if (answered === 0) {
        return {
            status: 'not_started',
            label: 'Not started',
            colorClass: 'text-slate-600 bg-slate-100 border-slate-200',
        };
    }
    if (answered < total) {
        return {
            status: 'in_progress',
            label: 'In progress',
            colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        };
    }
    return {
        status: 'complete',
        label: 'Complete',
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
}

/** Live preview when all questions in a category are answered (same bands as backend). */
export function previewCategoryScore(
    answers: Record<string, number>,
    dimension: EmotionalDimension,
    questionCount: number,
): { percent: number; status: EmotionalScoreStatus } | null {
    const values: number[] = [];
    for (let i = 0; i < questionCount; i += 1) {
        const v = answers[`${dimension}:${i}`];
        if (v == null) return null;
        values.push(v);
    }
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const percent = Math.round(((avg - 1) / 3) * 100);
    let status: EmotionalScoreStatus = 'developing';
    if (percent >= 75) status = 'strong';
    else if (percent >= 50) status = 'good';
    return { percent, status };
}

export function getEmotionalErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (typeof msg === 'string') return msg;
    }
    if (error instanceof Error) return error.message;
    return 'Could not load emotional intelligence data.';
}

export const EI_CATEGORY_PATHS: Record<EmotionalDimension, string> = {
    self_awareness: '/student/emotional/self-awareness',
    empathy: '/student/emotional/empathy',
    self_regulation: '/student/emotional/self-regulation',
};

export const EI_PATH_TO_DIMENSION: Record<string, EmotionalDimension> = {
    'self-awareness': 'self_awareness',
    empathy: 'empathy',
    'self-regulation': 'self_regulation',
};
