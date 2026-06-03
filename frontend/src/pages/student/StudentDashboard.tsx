import { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveLearnerProfile } from '../../hooks/useActiveLearnerProfile';
import { Card } from '../../components/ui/Card';
import { BarChart3, Clock, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentTopQuizPicks } from '../../components/features/student/StudentTopQuizPicks';
import { StudentRewardsSummary } from '../../components/features/rewards/StudentRewardsSummary';
import {
    fetchLearnerRecommendations,
    getRecommendationsErrorMessage,
    type AdaptiveInsights,
    type LearningProfile,
    type RecommendedQuiz,
} from '../../api/recommendations';
import { getCategoryDef, type LearningCategoryId } from '../../lib/learningCategories';
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
    const strongest = analytics?.summary.strongestSubject;
    const weakest = analytics?.summary.weakestSubject;
    const recentHistory = analytics?.recentHistory ?? [];

    const adaptiveEnabled = learningProfile?.adaptiveEnabled ?? false;
    const focusArea = adaptiveInsights?.focusArea;
    const strongestArea = adaptiveInsights?.strongestArea;
    const whatsNext = adaptiveInsights?.whatsNext;

    const focusLabel = adaptiveEnabled
        ? focusArea
            ? `${focusArea.label}${focusArea.averagePercent != null ? ` (${Math.round(focusArea.averagePercent)}%)` : ''}`
            : 'Explore all paths'
        : weakest && weakest.subject !== strongest?.subject
          ? weakest.label
          : 'Balanced';

    const strongestLabel = adaptiveEnabled
        ? strongestArea
            ? `${strongestArea.label}${strongestArea.averagePercent != null ? ` (${Math.round(strongestArea.averagePercent)}%)` : ''}`
            : focusArea
              ? 'More quizzes to compare'
              : '—'
        : strongest
          ? strongest.label
          : '—';

    const whatsNextStep = useMemo(() => {
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
        <div className="space-y-6 pb-8 p-6 md:p-8 font-sans">
            <header className="flex flex-col gap-2 w-full">
                <span className="inline-block text-4xl mb-1">👋</span>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 tracking-tight transform -rotate-1">
                    Hi, {learnerFirstName}!
                </h1>
                <p className="text-slate-500 font-bold text-lg">
                    {gradeLabel ? `${gradeLabel} learning paths` : 'Ready for a magical learning adventure?'} 🚀
                </p>
            </header>

            {getToken() && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-6 h-6 text-sky-600" />
                        <h2 className="text-2xl font-black text-slate-700">Performance summary</h2>
                    </div>
                    {analyticsError && (
                        <p className="text-sm text-orange-600 mb-3">{analyticsError}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <PerformanceChip
                            label="Quizzes done"
                            value={analyticsLoading ? '…' : String(completedQuizzes)}
                        />
                        <PerformanceChip
                            label="Average score"
                            value={analyticsLoading ? '…' : `${averagePercent}%`}
                        />
                        <PerformanceChip
                            label="Strongest area"
                            value={
                                recommendationsLoading || analyticsLoading
                                    ? '…'
                                    : strongestLabel
                            }
                            small
                        />
                        <PerformanceChip
                            label="Focus area"
                            value={
                                recommendationsLoading || analyticsLoading
                                    ? '…'
                                    : focusLabel
                            }
                            small
                        />
                    </div>
                </section>
            )}

            {getToken() && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        <h2 className="text-2xl font-black text-slate-700">What&apos;s next?</h2>
                    </div>
                    {recommendationsLoading ? (
                        <Card className="p-6 rounded-3xl border-2 border-violet-100 bg-violet-50/40">
                            <p className="text-sm font-medium text-slate-500">Loading your next quiz…</p>
                        </Card>
                    ) : recommendationsError ? (
                        <Card className="p-6 rounded-3xl border-2 border-orange-100 bg-orange-50/40">
                            <p className="text-sm text-orange-700">{recommendationsError}</p>
                            <button
                                type="button"
                                onClick={() => void loadRecommendations()}
                                className="mt-2 text-sm font-bold text-orange-600 hover:underline"
                            >
                                Try again
                            </button>
                        </Card>
                    ) : whatsNextStep ? (
                        <Card className="p-5 md:p-6 rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm">
                            <p className="text-sm font-bold text-violet-800 uppercase tracking-wide">
                                {whatsNextStep.label}
                                {whatsNextStep.adaptiveAction
                                    ? ` · ${whatsNextStep.adaptiveAction}`
                                    : ''}
                            </p>
                            <p className="font-black text-slate-800 text-xl mt-1">
                                {whatsNextStep.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-2">{whatsNextStep.reason}</p>
                            <Link
                                to={`/student/quiz/${whatsNextStep.quizId}`}
                                className="inline-flex mt-4 items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                            >
                                Start this quiz
                                <Play className="w-5 h-5 fill-current" />
                            </Link>
                        </Card>
                    ) : (
                        <Card className="p-6 rounded-3xl border-2 border-slate-100 bg-white">
                            <p className="text-sm text-slate-600">
                                Browse learning paths to pick your first quiz.
                            </p>
                            <Link
                                to="/student/quizzes"
                                className="inline-flex mt-3 text-sm font-bold text-violet-700 hover:underline"
                            >
                                View all quizzes →
                            </Link>
                        </Card>
                    )}
                </section>
            )}

            {getToken() && adaptiveEnabled && learningProfile && !recommendationsLoading && (
                <section>
                    <h2 className="text-lg font-black text-slate-700 mb-2">Learning profile</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {learningProfile.categories.map((row) => {
                            const def = getCategoryDef(row.category as LearningCategoryId);
                            const pct =
                                row.averagePercent != null
                                    ? `${Math.round(row.averagePercent)}%`
                                    : '—';
                            return (
                                <div
                                    key={row.category}
                                    className="rounded-xl border border-slate-100 bg-white px-2 py-2 text-center"
                                >
                                    <p className="text-[10px] font-bold text-slate-500 truncate">
                                        {def.shortLabel}
                                    </p>
                                    <p className="font-black text-slate-800 text-sm">{pct}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {getToken() && (
                <section>
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-orange-500" />
                            <h2 className="text-2xl font-black text-slate-700">Top picks</h2>
                        </div>
                        <Link
                            to="/student/quizzes"
                            className="text-sm font-bold text-orange-600 hover:underline shrink-0"
                        >
                            All paths →
                        </Link>
                    </div>
                    <Card className="p-5 md:p-6 rounded-3xl border-2 border-orange-100 bg-white/80">
                        <StudentTopQuizPicks
                            recommendations={recommendations}
                            isLoading={recommendationsLoading}
                            error={recommendationsError}
                            onRetry={() => void loadRecommendations()}
                            maxItems={3}
                        />
                    </Card>
                </section>
            )}

            {getToken() && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-6 h-6 text-slate-600" />
                        <h2 className="text-2xl font-black text-slate-700">Recent activity</h2>
                    </div>
                    <Card className="p-5 md:p-6 rounded-3xl border-2 border-slate-100 bg-white">
                        {analyticsLoading ? (
                            <p className="text-slate-500 text-sm font-medium py-4 text-center">
                                Loading activity...
                            </p>
                        ) : recentHistory.length === 0 ? (
                            <p className="text-slate-500 text-sm font-medium py-4 text-center">
                                Complete a quiz to see your recent activity here.
                            </p>
                        ) : (
                            <ul className="space-y-3">
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

function PerformanceChip({
    label,
    value,
    small,
}: {
    label: string;
    value: string;
    small?: boolean;
}) {
    return (
        <div className="rounded-2xl bg-white border-2 border-sky-100 px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
            <p
                className={`font-black text-slate-800 mt-1 leading-tight ${
                    small ? 'text-sm md:text-base' : 'text-xl'
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function RecentActivityRow({ attempt }: { attempt: RecentAttempt }) {
    return (
        <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{attempt.quizTitle}</p>
                <p className="text-xs text-slate-500">
                    {attempt.subjectLabel} · {formatRelativeTime(attempt.completedAt)}
                </p>
            </div>
            <span
                className={`shrink-0 font-black text-sm px-2.5 py-1 rounded-lg ${
                    attempt.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-700'
                        : attempt.percentage >= 60
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-amber-100 text-amber-700'
                }`}
            >
                {Math.round(attempt.percentage)}%
            </span>
        </li>
    );
}
