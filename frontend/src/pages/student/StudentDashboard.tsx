import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveLearnerProfile } from '../../hooks/useActiveLearnerProfile';
import { Card } from '../../components/ui/Card';
import { BarChart3, Clock, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AiRecommendedLevelBadge } from '../../components/features/ai/AiRecommendedLevelBadge';
import { AiChallengeOfTheDay } from '../../components/features/ai/AiChallengeOfTheDay';
import { StudentRewardsSummary } from '../../components/features/rewards/StudentRewardsSummary';
import { StudentEmotionalSummary } from '../../components/features/emotional/StudentEmotionalSummary';
import {
    fetchLearnerRecommendations,
    getRecommendationsErrorMessage,
    type AdaptiveInsights,
    type LearningProfile,
    type RecommendedQuiz,
} from '../../api/recommendations';
import {
    fetchChildAnalytics,
    formatRelativeTime,
    getAnalyticsErrorMessage,
    type ChildAnalytics,
    type RecentAttempt,
} from '../../api/analytics';
import {
    emptyChildRewards,
    fetchChildRewards,
    getRewardsErrorMessage,
    type ChildRewards,
} from '../../api/rewards';
import { useStudentGradeScope } from '../../hooks/useStudentGradeScope';
import { resolveActiveChildId } from '../../lib/activeChild';
import {
    dashboardSection,
    dashboardSectionTitle,
    pageHeading,
    pageShell,
    pageSubheading,
} from '../../lib/responsive';
import { cn } from '../../lib/utils';
import { getToken } from '../../lib/tokenStorage';

export const StudentDashboard = () => {
    const { learnerFirstName } = useActiveLearnerProfile();
    const { gradeLabel, scopeRecommendations } = useStudentGradeScope();
    const [recommendations, setRecommendations] = useState<RecommendedQuiz[]>([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
    const [topPick, setTopPick] = useState<RecommendedQuiz | null>(null);
    const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
    const [adaptiveInsights, setAdaptiveInsights] = useState<AdaptiveInsights | null>(null);
    const [rewards, setRewards] = useState<ChildRewards>(emptyChildRewards());
    const [rewardsError, setRewardsError] = useState<string | null>(null);
    const [rewardsLoading, setRewardsLoading] = useState(false);
    const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const loadDashboardData = useCallback(async () => {
        if (!getToken()) {
            setRewards(emptyChildRewards());
            setAnalytics(null);
            setRewardsError(null);
            setAnalyticsError(null);
            return;
        }

        setRewardsLoading(true);
        setAnalyticsLoading(true);
        setRewardsError(null);
        setAnalyticsError(null);

        try {
            const childId = await resolveActiveChildId();
            if (!childId) return;

            const [rewardsBundle, analyticsBundle] = await Promise.all([
                fetchChildRewards(childId),
                fetchChildAnalytics(childId),
            ]);
            setRewards(rewardsBundle.rewards);
            setAnalytics(analyticsBundle.analytics);
        } catch (err) {
            setRewardsError(getRewardsErrorMessage(err));
            setAnalyticsError(getAnalyticsErrorMessage(err));
        } finally {
            setRewardsLoading(false);
            setAnalyticsLoading(false);
        }
    }, []);

    const loadRecommendations = useCallback(async () => {
        if (!getToken()) {
            setRecommendations([]);
            setTopPick(null);
            setLearningProfile(null);
            setAdaptiveInsights(null);
            setRecommendationsError(null);
            setRecommendationsLoading(false);
            return;
        }

        setRecommendationsLoading(true);
        setRecommendationsError(null);
        try {
            const data = await fetchLearnerRecommendations();
            const scoped = scopeRecommendations(data.recommendations);
            setRecommendations(scoped);
            setLearningProfile(data.learningProfile ?? null);
            setAdaptiveInsights(data.adaptiveInsights ?? null);
            const whatsNextId = data.adaptiveInsights?.whatsNext?.quizId;
            const whatsNextQuiz = whatsNextId
                ? scoped.find((item) => item.quizId === whatsNextId)
                : null;
            setTopPick(
                whatsNextQuiz ??
                    scoped.find((item) => item.priority === 'high') ??
                    scoped[0] ??
                    null,
            );
        } catch (err) {
            setRecommendationsError(getRecommendationsErrorMessage(err));
            setRecommendations([]);
            setTopPick(null);
            setLearningProfile(null);
            setAdaptiveInsights(null);
        } finally {
            setRecommendationsLoading(false);
        }
    }, [scopeRecommendations]);

    useEffect(() => {
        void loadRecommendations();
        void loadDashboardData();
    }, [loadRecommendations, loadDashboardData]);

    const completedQuizzes = analytics?.summary.completedAttempts ?? 0;
    const averagePercent = Math.round(analytics?.summary.averageScorePercent ?? 0);
    const recentHistory = analytics?.recentHistory ?? [];

    const adaptiveEnabled = learningProfile?.adaptiveEnabled ?? false;
    const tierRecommendation = learningProfile?.tierRecommendation ?? null;
    const whatsNext = adaptiveInsights?.whatsNext;

    const recommendedNext = useMemo(() => {
        if (whatsNext) return whatsNext;
        if (!topPick) return null;
        return {
            quizId: topPick.quizId,
            title: topPick.title,
            category: topPick.category ?? topPick.subject,
            label: topPick.categoryLabel ?? topPick.subjectLabel,
            reason: topPick.reason,
            adaptiveAction: topPick.adaptiveAction ?? 'explore',
            priority: topPick.priority,
            recommendedDifficulty: topPick.recommendedDifficulty ?? 'medium',
        };
    }, [whatsNext, topPick]);

    return (
        <div className={cn(pageShell, 'space-y-5 sm:space-y-6 pb-6 sm:pb-8 font-sans')}>
            <header className="flex flex-col gap-2 w-full">
                <span className="inline-block text-3xl sm:text-4xl mb-1">👋</span>
                <h1
                    className={cn(
                        pageHeading,
                        'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 sm:transform sm:-rotate-1',
                    )}
                >
                    Hi, {learnerFirstName}!
                </h1>
                <p className={cn(pageSubheading, 'text-slate-500')}>
                    {gradeLabel ? `${gradeLabel} learning paths` : 'Ready for a magical learning adventure?'} 🚀
                </p>
            </header>

            {getToken() && adaptiveEnabled && (
                <section className={dashboardSection}>
                    <AiRecommendedLevelBadge
                        tierRecommendation={tierRecommendation}
                        isLoading={recommendationsLoading}
                    />
                    <AiChallengeOfTheDay
                        recommendations={recommendations}
                        tierRecommendation={tierRecommendation}
                        isLoading={recommendationsLoading}
                    />
                </section>
            )}

            {getToken() && (
                <section className={dashboardSection}>
                    <h2 className={dashboardSectionTitle}>
                        <Sparkles className="w-6 h-6 text-violet-600 shrink-0" aria-hidden />
                        Recommended next quiz
                    </h2>
                    {recommendationsLoading ? (
                        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-violet-100 bg-violet-50/40">
                            <p className="text-sm font-medium text-slate-500">Loading your next quiz…</p>
                        </Card>
                    ) : recommendationsError ? (
                        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-orange-100 bg-orange-50/40">
                            <p className="text-sm text-orange-700">{recommendationsError}</p>
                            <button
                                type="button"
                                onClick={() => void loadRecommendations()}
                                className="mt-2 text-sm font-bold text-orange-600 hover:underline"
                            >
                                Try again
                            </button>
                        </Card>
                    ) : recommendedNext ? (
                        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm">
                            <p className="text-sm font-bold text-violet-800 uppercase tracking-wide">
                                {recommendedNext.label}
                                {recommendedNext.adaptiveAction
                                    ? ` · ${recommendedNext.adaptiveAction}`
                                    : ''}
                            </p>
                            <p className="font-black text-slate-800 text-lg sm:text-xl mt-1 break-words">
                                {recommendedNext.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-2">{recommendedNext.reason}</p>
                            <Link
                                to={`/student/quiz/${recommendedNext.quizId}`}
                                className="inline-flex mt-4 items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-xl transition-colors min-h-11"
                            >
                                Start this quiz
                                <Play className="w-5 h-5 fill-current shrink-0" aria-hidden />
                            </Link>
                        </Card>
                    ) : (
                        <Card className="p-5 sm:p-6 rounded-2xl border-2 border-slate-100 bg-white">
                            <p className="text-sm text-slate-600">
                                Browse learning paths to pick your first quiz.
                            </p>
                            <Link
                                to="/student/quizzes"
                                className="inline-flex mt-3 text-sm font-bold text-violet-700 hover:underline min-h-11 items-center"
                            >
                                View all quizzes →
                            </Link>
                        </Card>
                    )}
                </section>
            )}

            {getToken() && (
                <section className={dashboardSection}>
                    <h2 className={dashboardSectionTitle}>
                        <BarChart3 className="w-6 h-6 text-sky-600 shrink-0" aria-hidden />
                        Quick stats
                    </h2>
                    {analyticsError && (
                        <p className="text-sm text-orange-600">{analyticsError}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <PerformanceChip
                            label="Quizzes done"
                            value={analyticsLoading ? '…' : String(completedQuizzes)}
                        />
                        <PerformanceChip
                            label="Average score"
                            value={analyticsLoading ? '…' : `${averagePercent}%`}
                        />
                    </div>
                </section>
            )}

            {getToken() && (
                <section className={dashboardSection}>
                    <h2 className={dashboardSectionTitle}>
                        <Clock className="w-6 h-6 text-slate-600 shrink-0" aria-hidden />
                        Recent activity
                    </h2>
                    <Card className="p-4 sm:p-5 rounded-2xl border-2 border-slate-100 bg-white">
                        {analyticsLoading ? (
                            <p className="text-slate-500 text-sm font-medium py-4 text-center">
                                Loading activity...
                            </p>
                        ) : recentHistory.length === 0 ? (
                            <p className="text-slate-500 text-sm font-medium py-4 text-center">
                                Complete a quiz to see your recent activity here.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {recentHistory.slice(0, 5).map((attempt) => (
                                    <RecentActivityRow key={attempt.attemptId} attempt={attempt} />
                                ))}
                            </ul>
                        )}
                    </Card>
                </section>
            )}

            {getToken() && (
                <section>
                    <StudentEmotionalSummary />
                </section>
            )}

            {getToken() && (
                <section>
                    <StudentRewardsSummary
                        rewards={rewards}
                        loading={rewardsLoading}
                        error={rewardsError}
                    />
                </section>
            )}
        </div>
    );
};

function PerformanceChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white border-2 border-sky-100 px-4 py-3 shadow-sm min-h-[4.5rem] flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
            <p className="font-black text-slate-800 mt-1 text-lg leading-tight">{value}</p>
        </div>
    );
}

function RecentActivityRow({ attempt }: { attempt: RecentAttempt }) {
    return (
        <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 sm:px-4 py-2.5">
            <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate text-sm">{attempt.quizTitle}</p>
                <p className="text-xs text-slate-500 truncate">
                    {attempt.subjectLabel} · {formatRelativeTime(attempt.completedAt)}
                </p>
            </div>
            <span
                className={cn(
                    'shrink-0 font-black text-sm px-2.5 py-1 rounded-lg',
                    attempt.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-700'
                        : attempt.percentage >= 60
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700',
                )}
            >
                {Math.round(attempt.percentage)}%
            </span>
        </li>
    );
}
