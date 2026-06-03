import type {
    ChildAnalytics,
    ParentAnalyticsOverview,
    RecentAttempt,
    SubjectStat,
    WeeklyProgressPoint,
} from './analytics';

export type PerformanceOverview = {
    completedQuizzes: number;
    averageScore: string;
    bestSubject: { label: string; averagePercent: number } | null;
    focusArea: { label: string; averagePercent: number } | null;
};

export type ChildComparisonRow = {
    id: number;
    name: string;
    completedQuizzes: number;
    averageScorePercent: number;
    bestSubjectLabel: string;
    focusAreaLabel: string;
};

export type ParentReportsViewModel = {
    childId: number;
    childName: string;
    hasData: boolean;
    performanceOverview: PerformanceOverview;
    subjectBreakdown: SubjectStat[];
    weeklyProgress: WeeklyProgressPoint[];
    recentHistory: RecentAttempt[];
    multiChildComparison: ChildComparisonRow[] | null;
};

export function buildPerformanceOverview(analytics: ChildAnalytics): PerformanceOverview {
    const { summary } = analytics;
    const strongest = summary.strongestSubject;
    const weakest = summary.weakestSubject;

    return {
        completedQuizzes: summary.completedAttempts,
        averageScore:
            summary.completedAttempts > 0
                ? `${Math.round(summary.averageScorePercent)}%`
                : '—',
        bestSubject: strongest
            ? { label: strongest.label, averagePercent: strongest.averagePercent }
            : null,
        focusArea:
            weakest &&
            (!strongest || weakest.subject !== strongest.subject)
                ? { label: weakest.label, averagePercent: weakest.averagePercent }
                : weakest
                  ? { label: weakest.label, averagePercent: weakest.averagePercent }
                  : null,
    };
}

export function buildMultiChildComparison(
    children: ParentAnalyticsOverview['children'],
): ChildComparisonRow[] | null {
    if (children.length <= 1) {
        return null;
    }

    return children.map((child) => ({
        id: child.id,
        name: child.name,
        completedQuizzes: child.summary.completedAttempts,
        averageScorePercent: Math.round(child.summary.averageScorePercent),
        bestSubjectLabel: child.summary.strongestSubject?.label ?? '—',
        focusAreaLabel: child.summary.weakestSubject?.label ?? '—',
    }));
}

type ChildWithAnalytics = ParentAnalyticsOverview['children'][number];

export function buildParentReportsViewModel(
    child: ChildWithAnalytics,
    allChildren: ParentAnalyticsOverview['children'],
): ParentReportsViewModel {
    return {
        childId: child.id,
        childName: child.name,
        hasData: child.summary.completedAttempts > 0,
        performanceOverview: buildPerformanceOverview(child),
        subjectBreakdown: child.subjectBreakdown ?? [],
        weeklyProgress: child.weeklyProgress ?? [],
        recentHistory: child.recentHistory ?? [],
        multiChildComparison: buildMultiChildComparison(allChildren),
    };
}
