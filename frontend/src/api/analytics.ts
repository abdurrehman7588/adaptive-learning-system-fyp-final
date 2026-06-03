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

export type SubjectDailyTrendPoint = {
    date: string;
    subject: string;
    subjectLabel: string;
    averagePercent: number;
};

export type StudyTimeComparison = {
    recentSeconds: number;
    priorSeconds: number;
};

export type LearningSpeedInsights = {
    timedAnswerCount: number;
    averageResponseSeconds: number;
    totalStudyTimeSeconds: number;
    fastThresholdSeconds: number;
    slowThresholdSeconds: number;
    signals: {
        strong_understanding: number;
        needs_practice: number;
        weak_concept: number;
        quick_miss: number;
        steady_correct: number;
        needs_review: number;
        untracked: number;
    };
    weakConceptsFromTiming: Array<{ key: string; label: string; count: number }>;
    summaryMessage: string;
};

export type PerformanceTrend = {
    direction: 'improving' | 'declining' | 'stable';
    changePercent: number;
    label: string;
};

export type ChildAnalytics = {
    summary: {
        totalAttempts: number;
        completedAttempts: number;
        averageScore?: number;
        averageScorePercent: number;
        averagePercentage?: number;
        strongestSubject: SubjectStat | null;
        weakestSubject: SubjectStat | null;
        performanceTrend?: PerformanceTrend;
        lastActivityAt?: string | null;
        learningSpeed: LearningSpeedInsights;
    };
    performanceTrend?: PerformanceTrend;
    subjectBreakdown: SubjectStat[];
    weeklyProgress: WeeklyProgressPoint[];
    subjectDailyTrends: SubjectDailyTrendPoint[];
    studyTimeComparison: StudyTimeComparison;
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
        averageScore?: number;
        averageScorePercent: number;
        averagePercentage?: number;
        performanceTrend?: PerformanceTrend;
        lastActivityAt?: string | null;
    };
    children: Array<{
        id: number;
        name: string;
        gradeLevel?: string | null;
    } & ChildAnalytics>;
};

export const emptyLearningSpeed = (): LearningSpeedInsights => ({
    timedAnswerCount: 0,
    averageResponseSeconds: 0,
    totalStudyTimeSeconds: 0,
    fastThresholdSeconds: 25,
    slowThresholdSeconds: 45,
    signals: {
        strong_understanding: 0,
        needs_practice: 0,
        weak_concept: 0,
        quick_miss: 0,
        steady_correct: 0,
        needs_review: 0,
        untracked: 0,
    },
    weakConceptsFromTiming: [],
    summaryMessage:
        'Complete a timed quiz to see how quickly your child answers each question.',
});

function normalizeChildRow(
    child: ParentAnalyticsOverview['children'][number],
): ParentAnalyticsOverview['children'][number] {
    const summary = child.summary ?? ({} as ChildAnalytics['summary']);
    const learningSpeed =
        summary.learningSpeed ??
        (child as { learningSpeed?: LearningSpeedInsights }).learningSpeed ??
        emptyLearningSpeed();

    return {
        ...child,
        summary: {
            ...summary,
            learningSpeed,
        },
        subjectDailyTrends: child.subjectDailyTrends ?? [],
        studyTimeComparison: child.studyTimeComparison ?? {
            recentSeconds: 0,
            priorSeconds: 0,
        },
    };
}

export async function fetchParentAnalyticsOverview(): Promise<ParentAnalyticsOverview> {
    const { data } = await apiClient.get<{ overview: ParentAnalyticsOverview }>(
        '/children/analytics/overview',
        { params: { _: Date.now() } },
    );
    const overview = data.overview;
    return {
        ...overview,
        children: (overview.children ?? []).map(normalizeChildRow),
    };
}

export async function fetchChildAnalytics(childId: number): Promise<ChildAnalyticsBundle> {
    const { data } = await apiClient.get<ChildAnalyticsBundle>(
        `/children/${childId}/analytics`,
        { params: { _: Date.now() } },
    );

    const analytics = data.analytics;
    const learningSpeed =
        analytics.summary?.learningSpeed ?? emptyLearningSpeed();

    return {
        child: data.child,
        analytics: {
            ...analytics,
            summary: {
                ...analytics.summary,
                learningSpeed,
            },
            subjectDailyTrends: analytics.subjectDailyTrends ?? [],
            studyTimeComparison: analytics.studyTimeComparison ?? {
                recentSeconds: 0,
                priorSeconds: 0,
            },
        },
    };
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
