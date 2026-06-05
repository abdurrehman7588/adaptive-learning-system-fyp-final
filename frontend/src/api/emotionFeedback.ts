import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type EmotionFeedbackSlug =
    | 'very_easy_fun'
    | 'confident'
    | 'okay'
    | 'difficult'
    | 'frustrated';

export type EmotionFeedbackOption = {
    slug: EmotionFeedbackSlug;
    label: string;
    emoji: string;
    score: number;
};

/** Mirrors backend/src/modules/emotion-feedback/constants/emotionFeedback.constants.js */
export const EMOTION_FEEDBACK_OPTIONS: EmotionFeedbackOption[] = [
    { slug: 'very_easy_fun', label: 'Very Easy & Fun', emoji: '😄', score: 90 },
    { slug: 'confident', label: 'Confident', emoji: '😊', score: 80 },
    { slug: 'okay', label: 'Okay', emoji: '😐', score: 60 },
    { slug: 'difficult', label: 'Difficult', emoji: '😕', score: 40 },
    { slug: 'frustrated', label: 'Frustrated', emoji: '😣', score: 20 },
];

export type EmotionFeedbackRow = {
    id: number;
    childId: number;
    quizAttemptId: number;
    emotionLabel: string;
    emotionScore: number;
    createdAt: string;
    quizTitle?: string | null;
    quizId?: number | null;
};

export async function submitQuizEmotionFeedback(
    quizAttemptId: number,
    emotionLabel: EmotionFeedbackSlug,
): Promise<EmotionFeedbackRow> {
    const { data } = await apiClient.post<{ data: EmotionFeedbackRow }>('/emotion-feedback', {
        quiz_attempt_id: quizAttemptId,
        emotion_label: emotionLabel,
    });
    return data.data;
}

export async function fetchChildEmotionFeedback(childId: number): Promise<{
    childId: number;
    latest: EmotionFeedbackRow | null;
    items: EmotionFeedbackRow[];
}> {
    const { data } = await apiClient.get<{
        data: { childId: number; latest: EmotionFeedbackRow | null; items: EmotionFeedbackRow[] };
    }>(`/emotion-feedback/${childId}`);
    return data.data;
}

export function getEmotionFeedbackErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not save how you felt. You can skip and continue.';
}
