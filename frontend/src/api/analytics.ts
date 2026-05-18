import { isAxiosError } from 'axios';
import { apiClient } from './client';

export type SubjectStat = {
    subject: string;
    label: string;
    attempts: number;
    averagePercent: number;
};

export type RecentAttempt = {
    attemptId: number;
    quizId: number;
    quizTitle: string;
    subject: string;
    subjectLabel: string;
    score: number;
    totalPoints: number;
    percentage: number;
    completedAt: string;
};

export type WeeklyProgressPoint = {
    date: string;
    label: string;
    averagePercent: number;
    attempts: number;
};

export type ChildAnalytics = {
    summary: {
        totalAttempts: number;
        completedAttempts: number;
        averageScorePercent: number;
        strongestSubject: SubjectStat | null;
        weakestSubject: SubjectStat | null;
    };
    subjectBreakdown: SubjectStat[];
    weeklyProgress: WeeklyProgressPoint[];
    recentHistory: RecentAttempt[];
};

export type ChildAnalyticsBundle = {
    child: {
        id: number;
        name: string;
        gradeLevel?: string | null;
    };
    analytics: ChildAnalytics;
};

export type ParentAnalyticsOverview = {
    summary: {
        childCount: number;
        totalAttempts: number;
        completedAttempts: number;
        averageScorePercent: number;
    };
    children: Array<{
        id: number;
        name: string;
        gradeLevel?: string | null;
    } & ChildAnalytics>;
};

export async function fetchParentAnalyticsOverview(): Promise<ParentAnalyticsOverview> {
    const { data } = await apiClient.get<{ overview: ParentAnalyticsOverview }>(
        '/children/analytics/overview',
    );
    return data.overview;
}

export async function fetchChildAnalytics(childId: number): Promise<ChildAnalyticsBundle> {
    const { data } = await apiClient.get<ChildAnalyticsBundle>(
        `/children/${childId}/analytics`,
    );
    return data;
}

export function getAnalyticsErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const payload = error.response?.data;
        if (payload && typeof payload === 'object') {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === 'string') return record.message;
        }
        if (error.response?.status === 401) {
            return 'Please sign in with a parent account to view analytics.';
        }
        if (error.response?.status === 404) {
            return 'Analytics API not found. Restart the backend (npm start in the backend folder), then refresh this page.';
        }
    }
    if (error instanceof Error) return error.message;
    return 'Could not load analytics. Please try again.';
}

export function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
