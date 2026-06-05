import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { PerformanceCharts } from '../../components/features/PerformanceCharts';
import {
    emptyLearningSpeed,
    fetchParentAnalyticsOverview,
    formatRelativeTime,
    getAnalyticsErrorMessage,
    type ChildAnalytics,
    type LearningSpeedInsights,
    type RecentAttempt,
} from '../../api/analytics';
import {
    getActiveChildId,
    resolveSelectedChildIdFromList,
    setActiveChildId,
} from '../../lib/activeChild';
import { getToken } from '../../lib/tokenStorage';
import type { ParentAnalyticsOverview } from '../../api/analytics';
import {
    Activity,
    Brain,
    TrendingUp,
    ChevronRight,
    BookOpen,
    Loader2,
    Target,
    AlertCircle,
    Sparkles,
    Clock,
} from 'lucide-react';
import { ParentAchievementSummary } from '../../components/features/rewards/ParentAchievementSummary';
import { ParentEmotionalProgress } from '../../components/features/emotional/ParentEmotionalProgress';
import {
    fetchParentRewardsOverview,
    getRewardsErrorMessage,
    type ChildWithRewards,
} from '../../api/rewards';
import { RecommendedQuizzes } from '../../components/features/RecommendedQuizzes';
import {
    fetchParentRecommendationsOverview,
    getRecommendationsErrorMessage,
    type ChildRecommendations,
} from '../../api/recommendations';
import { AiRecommendationCard } from '../../components/features/ai/AiRecommendationCard';
import { pageShellWide, dashboardSection, dashboardSectionTitle } from '../../lib/responsive';

type ChildWithAnalytics = {
    id: number;
    name: string;
    gradeLevel?: string | null;
} & ChildAnalytics;

export const ParentDashboard = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState<ChildWithAnalytics[]>([]);
    const [overviewSummary, setOverviewSummary] = useState<
        ParentAnalyticsOverview['summary'] | null
    >(null);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(() =>
        getActiveChildId(),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recommendationsByChild, setRecommendationsByChild] = useState<ChildRecommendations[]>(
        [],
    );
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
    const [rewardsByChild, setRewardsByChild] = useState<ChildWithRewards[]>([]);
    const [rewardsLoading, setRewardsLoading] = useState(true);
    const [rewardsError, setRewardsError] = useState<string | null>(null);

    const loadAnalytics = useCallback(async () => {
        if (!getToken()) {
            setChildren([]);
            setOverviewSummary(null);
            setSelectedChildId(null);
            setIsLoading(false);
            setError(
                'Sign in with your parent account (e.g. parent@demo.com / password123) to load quiz analytics from the server.',
            );
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const overview = await fetchParentAnalyticsOverview();
            setChildren(overview.children);
            setOverviewSummary(overview.summary);
            setSelectedChildId((current) =>
                resolveSelectedChildIdFromList(overview.children, current),
            );
        } catch (err) {
            setError(getAnalyticsErrorMessage(err));
            setChildren([]);
            setOverviewSummary(null);
            setSelectedChildId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadRewards = useCallback(async () => {
        if (!getToken()) {
            setRewardsByChild([]);
            setRewardsLoading(false);
            setRewardsError(null);
            return;
        }

        setRewardsLoading(true);
        setRewardsError(null);
        try {
            const overview = await fetchParentRewardsOverview();
            setRewardsByChild(overview.children);
        } catch (err) {
            setRewardsError(getRewardsErrorMessage(err));
            setRewardsByChild([]);
        } finally {
            setRewardsLoading(false);
        }
    }, []);

    const loadRecommendations = useCallback(async () => {
        if (!getToken()) {
            setRecommendationsByChild([]);
            setRecommendationsLoading(false);
            setRecommendationsError(null);
            return;
        }

        setRecommendationsLoading(true);
        setRecommendationsError(null);
        try {
            const overview = await fetchParentRecommendationsOverview();
            setRecommendationsByChild(overview.children);
        } catch (err) {
            setRecommendationsError(getRecommendationsErrorMessage(err));
            setRecommendationsByChild([]);
        } finally {
            setRecommendationsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAnalytics();
        void loadRecommendations();
        void loadRewards();
    }, [loadAnalytics, loadRecommendations, loadRewards]);

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === 'visible') {
                void loadAnalytics();
                void loadRecommendations();
                void loadRewards();
            }
        };
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [loadAnalytics, loadRecommendations, loadRewards]);

    const selectedChild = useMemo(
        () =>
            children.find((child) => Number(child.id) === Number(selectedChildId)) ?? null,
        [children, selectedChildId],
    );

    const selectedRecommendations = useMemo(() => {
        const bundle = recommendationsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.recommendations ?? [];
    }, [recommendationsByChild, selectedChildId]);

    const selectedSubjectProfile = useMemo(() => {
        const bundle = recommendationsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.subjectProfile ?? null;
    }, [recommendationsByChild, selectedChildId]);

    const selectedRewards = useMemo(() => {
        const bundle = rewardsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.rewards ?? null;
    }, [rewardsByChild, selectedChildId]);

    const selectedConceptProfile = useMemo(() => {
        const bundle = recommendationsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.conceptProfile ?? null;
    }, [recommendationsByChild, selectedChildId]);

    const selectedAdaptiveInsights = useMemo(() => {
        const bundle = recommendationsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.adaptiveInsights ?? null;
    }, [recommendationsByChild, selectedChildId]);

    const selectedLearningProfile = useMemo(() => {
        const bundle = recommendationsByChild.find(
            (child) => Number(child.id) === Number(selectedChildId),
        );
        return bundle?.learningProfile ?? null;
    }, [recommendationsByChild, selectedChildId]);

    const handleChildChange = (childId: number) => {
        setSelectedChildId(childId);
        setActiveChildId(childId);
    };

    const summary = selectedChild?.summary;
    const strongest = summary?.strongestSubject;
    const weakest = summary?.weakestSubject;

    const adaptiveEnabled = selectedLearningProfile?.adaptiveEnabled ?? false;
    const tierRecommendation = selectedLearningProfile?.tierRecommendation ?? null;
    const weakestCategory = selectedAdaptiveInsights?.weakestCategory;
    const strongestCategory = selectedAdaptiveInsights?.strongestCategory;
    const suggestedNext = selectedAdaptiveInsights?.suggestedNextActivity;

    const completedCount =
        summary?.completedAttempts ?? overviewSummary?.completedAttempts ?? 0;
    const totalAttempts =
        summary?.totalAttempts ?? overviewSummary?.totalAttempts ?? 0;
    const averageScorePercent =
        summary?.averageScorePercent ?? overviewSummary?.averageScorePercent ?? 0;

    const learningSpeed: LearningSpeedInsights = useMemo(() => {
        const fromAnalytics = selectedChild?.summary?.learningSpeed;
        const fromRecommendations = selectedConceptProfile?.learningSpeed;
        if (fromAnalytics && typeof fromAnalytics.timedAnswerCount === 'number') {
            return fromAnalytics;
        }
        if (fromRecommendations && typeof fromRecommendations.timedAnswerCount === 'number') {
            return fromRecommendations;
        }
        return emptyLearningSpeed();
    }, [selectedChild?.summary?.learningSpeed, selectedConceptProfile?.learningSpeed]);

    const hasTimedAnswers = learningSpeed.timedAnswerCount > 0;

    return (
        <motion.div
            className={cn(
                pageShellWide,
                'space-y-5 sm:space-y-6 w-full min-w-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 relative',
            )}
        >
            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tight break-words">
                        Welcome back, {user?.name?.split(' ')[0] || 'Parent'}!
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Track quiz performance and learning progress from completed attempts.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {children.length > 0 && selectedChildId && (
                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Child profile
                            </span>
                            <select
                                value={selectedChildId}
                                onChange={(event) => handleChildChange(Number(event.target.value))}
                                className="text-sm font-medium text-slate-700 bg-white px-3 py-2.5 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto sm:min-w-[12rem] max-w-full"
                                aria-label="Select child"
                            >
                                {children.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                        {child.gradeLevel ? ` · ${child.gradeLevel}` : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-center">
                        Today,{' '}
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </header>

            {error && (
                <motion.div className="relative z-10 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                    <p className="font-medium">{error}</p>
                    <button
                        type="button"
                        onClick={() => void loadAnalytics()}
                        className="text-sm font-semibold underline shrink-0"
                    >
                        Retry
                    </button>
                </motion.div>
            )}

            {isLoading && (
                <div className="relative z-10 flex items-center justify-center gap-3 py-16 text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
                    <p className="font-medium">Loading dashboard data...</p>
                </div>
            )}

            {selectedChild && !isLoading && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 relative z-10">
                        <StatsCard
                            title="Quizzes Completed"
                            value={String(completedCount)}
                            trend={`${totalAttempts} total attempts`}
                            icon={Brain}
                            color="violet"
                            trendColor="text-slate-500"
                        />
                        <StatsCard
                            title="Average Score"
                            value={`${Math.round(averageScorePercent)}%`}
                            trend={
                                strongest
                                    ? `Strongest: ${strongest.label} (${Math.round(strongest.averagePercent)}%)`
                                    : 'Complete quizzes to see trends'
                            }
                            icon={TrendingUp}
                            color="indigo"
                            trendColor="text-emerald-500"
                        />
                        <StatsCard
                            title="Avg Response Time"
                            value={hasTimedAnswers ? `${learningSpeed.averageResponseSeconds}s` : '—'}
                            trend={
                                hasTimedAnswers
                                    ? `${learningSpeed.timedAnswerCount} timed answers`
                                    : 'From timed quizzes'
                            }
                            icon={Clock}
                            color="indigo"
                            trendColor="text-slate-400"
                            compact
                        />
                        <StatsCard
                            title="Weakest category"
                            value={
                                adaptiveEnabled
                                    ? weakestCategory?.label ?? 'Balanced'
                                    : weakest && weakest.subject !== strongest?.subject
                                      ? weakest.label
                                      : 'Balanced'
                            }
                            trend={
                                adaptiveEnabled && weakestCategory?.averagePercent != null
                                    ? `${Math.round(weakestCategory.averagePercent)}% · ${weakestCategory.status.replace(/_/g, ' ')}`
                                    : weakest && weakest.subject !== strongest?.subject
                                      ? `${Math.round(weakest.averagePercent)}% avg - needs practice`
                                      : 'Complete quizzes to see category insights'
                            }
                            icon={Target}
                            color="emerald"
                            trendColor="text-amber-600"
                        />
                        <StatsCard
                            title="Strongest category"
                            value={
                                adaptiveEnabled
                                    ? strongestCategory?.label ?? '—'
                                    : strongest?.label ?? '—'
                            }
                            trend={
                                adaptiveEnabled && strongestCategory?.averagePercent != null
                                    ? `${Math.round(strongestCategory.averagePercent)}% · ${strongestCategory.status.replace(/_/g, ' ')}`
                                    : strongest
                                      ? `${Math.round(strongest.averagePercent)}% avg`
                                      : '—'
                            }
                            icon={TrendingUp}
                            color="violet"
                            trendColor="text-emerald-600"
                        />
                    </div>

                    {adaptiveEnabled && (
                        <section className={cn(dashboardSection, 'relative z-10')}>
                            <h2 className={dashboardSectionTitle}>
                                <Brain className="w-6 h-6 text-teal-600 shrink-0" aria-hidden />
                                AI learning insights
                            </h2>
                            <AiRecommendationCard
                                tierRecommendation={tierRecommendation}
                                isLoading={recommendationsLoading}
                                childName={selectedChild.name}
                            />
                        </section>
                    )}

                    {adaptiveEnabled && suggestedNext && (
                        <div className="relative z-10 rounded-2xl border border-teal-100 bg-white/90 p-5 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-teal-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Suggested next activity
                            </h3>
                            <p className="font-bold text-slate-800 text-lg mt-2">
                                {suggestedNext.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">{suggestedNext.reason}</p>
                            <p className="text-xs text-slate-500 mt-2 capitalize">
                                {suggestedNext.label} · {suggestedNext.adaptiveAction} ·{' '}
                                {suggestedNext.recommendedDifficulty} level
                            </p>
                        </div>
                    )}

                    <LearningPaceInsight
                        childName={selectedChild.name}
                        learningSpeed={learningSpeed}
                        hasTimedAnswers={hasTimedAnswers}
                    />

                    <ParentAchievementSummary
                        rewards={selectedRewards}
                        childName={selectedChild.name}
                        loading={rewardsLoading}
                        error={rewardsError}
                    />

                    <ParentEmotionalProgress
                        childId={selectedChildId}
                        childName={selectedChild.name}
                    />
                </>
            )}

            <section className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-teal-500" />
                        Adaptive Recommendations
                        {selectedChild && (
                            <span className="text-sm font-medium text-slate-400">
                                · {selectedChild.name}
                            </span>
                        )}
                    </h2>
                </div>
                {selectedConceptProfile && selectedConceptProfile.totalQuestionAttempts > 0 && (
                    <div className="mb-4 space-y-3 max-w-3xl">
                        <p className="text-sm text-slate-500">
                            Question-level accuracy:{' '}
                            <span className="font-semibold text-slate-700">
                                {Math.round(selectedConceptProfile.overallQuestionAccuracy)}%
                            </span>
                            {' · '}
                            {selectedConceptProfile.difficultyProgression.message}
                        </p>
                        {selectedConceptProfile.weakConcepts.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase text-amber-700">
                                    Weak concepts
                                </span>
                                {selectedConceptProfile.weakConcepts.map((concept) => (
                                    <span
                                        key={`${concept.conceptType}-${concept.key}`}
                                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                                    >
                                        {concept.label} · {Math.round(concept.accuracyPercent)}%
                                    </span>
                                ))}
                            </div>
                        )}
                        {selectedConceptProfile.masteryConcepts.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase text-emerald-700">
                                    Mastery
                                </span>
                                {selectedConceptProfile.masteryConcepts.map((concept) => (
                                    <span
                                        key={`m-${concept.conceptType}-${concept.key}`}
                                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    >
                                        {concept.label} · {Math.round(concept.accuracyPercent)}%
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {!selectedConceptProfile?.totalQuestionAttempts &&
                    selectedSubjectProfile?.weakest && (
                        <p className="text-sm text-slate-500 mb-4 max-w-3xl">
                            Complete more quizzes to unlock question-level concept insights.
                        </p>
                    )}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                    <RecommendedQuizzes
                        recommendations={selectedRecommendations}
                        isLoading={recommendationsLoading}
                        error={recommendationsError}
                        childName={selectedChild?.name}
                        variant="parent"
                        onRetry={() => void loadRecommendations()}
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10 min-w-0">
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                Performance Overview
                                {selectedChild && (
                                    <span className="text-sm font-medium text-slate-400">
                                        · {selectedChild.name}
                                    </span>
                                )}
                            </h2>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1 hover:shadow-md transition-shadow duration-300">
                            <PerformanceCharts
                                weeklyProgress={selectedChild?.weeklyProgress ?? []}
                                subjectBreakdown={selectedChild?.subjectBreakdown ?? []}
                                strongestSubject={strongest}
                                isLoading={isLoading}
                            />
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-orange-500" />
                            Recent Quiz History
                        </h3>

                        {isLoading && (
                            <div className="flex justify-center py-10 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}

                        {!isLoading && !selectedChild?.recentHistory.length && (
                            <div className="text-center py-8 text-slate-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="font-medium">No completed quizzes yet</p>
                                <p className="text-sm mt-1">
                                    Have your child finish a quiz to see results here.
                                </p>
                            </div>
                        )}

                        {!isLoading && selectedChild && selectedChild.recentHistory.length > 0 && (
                            <div className="space-y-4">
                                {selectedChild.recentHistory.map((attempt) => (
                                    <ActivityItem key={attempt.attemptId} attempt={attempt} />
                                ))}
                            </div>
                        )}

                        <Link
                            to="/parent/reports"
                            className="w-full mt-6 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-1 group"
                        >
                            View Full Reports
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 shadow-lg text-white">
                        <h3 className="text-lg font-bold mb-2">Learning tip</h3>
                        <p className="text-teal-100 text-sm mb-4">
                            {weakest && weakest.subject !== strongest?.subject
                                ? `Short practice sessions in ${weakest.label} can help balance subject mastery.`
                                : 'Consistent quiz practice builds steady progress across all subjects.'}
                        </p>
                        {strongest && (
                            <p className="text-xs text-teal-200/90">
                                Current strength: {strongest.label} (
                                {Math.round(strongest.averagePercent)}% average)
                            </p>
                        )}
                    </div>
                </div>
            </div>
    </motion.div>
    );
};

type StatsCardProps = {
    title: string;
    value: string;
    trend: string;
    icon: ComponentType<{ className?: string }>;
    color: 'indigo' | 'violet' | 'emerald';
    trendColor: string;
    compact?: boolean;
};

const StatsCard = ({
    title,
    value,
    trend,
    icon: Icon,
    color,
    trendColor,
    compact = false,
}: StatsCardProps) => {
    const colorClasses: Record<StatsCardProps['color'], string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        violet: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <motion.div
            whileHover={{ y: compact ? -2 : -4 }}
            className={cn(
                'bg-white rounded-2xl shadow-sm border border-slate-100',
                compact ? 'p-4' : 'p-6',
            )}
        >
            <div className={cn('mb-3', compact && 'mb-2')}>
                <div
                    className={cn(
                        'rounded-2xl inline-flex',
                        colorClasses[color],
                        compact ? 'p-2' : 'p-3',
                    )}
                >
                    <Icon className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
                </div>
            </div>
            <div>
                <h3
                    className={cn(
                        'text-slate-500 font-semibold uppercase tracking-wider mb-1',
                        compact ? 'text-[11px]' : 'text-sm',
                    )}
                >
                    {title}
                </h3>
                <div
                    className={cn(
                        'font-bold text-slate-800 tracking-tight',
                        compact ? 'text-2xl' : 'text-3xl',
                    )}
                >
                    {value}
                </div>
                <p
                    className={cn(
                        'font-medium',
                        compact ? 'text-xs mt-1.5' : 'text-sm mt-2',
                        trendColor,
                    )}
                >
                    {trend}
                </p>
            </div>
        </motion.div>
    );
};

type LearningPaceInsightProps = {
    childName: string;
    learningSpeed: LearningSpeedInsights;
    hasTimedAnswers: boolean;
};

const LearningPaceInsight = ({
    childName,
    learningSpeed,
    hasTimedAnswers,
}: LearningPaceInsightProps) => (
    <div className="relative z-10 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                Learning pace
            </p>
            {hasTimedAnswers ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 min-w-0">
                    <span>{learningSpeed.summaryMessage}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="text-emerald-700">
                        {learningSpeed.signals.strong_understanding} strong
                    </span>
                    <span className="text-amber-700">
                        {learningSpeed.signals.needs_practice} slow
                    </span>
                    <span className="text-rose-700">
                        {learningSpeed.signals.weak_concept} weak
                    </span>
                </div>
            ) : (
                <p className="text-xs text-slate-500">
                    Complete a timed quiz as {childName} to unlock pace insights.
                </p>
            )}
        </div>
    </div>
);

const ActivityItem = ({ attempt }: { attempt: RecentAttempt }) => (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-teal-100 text-teal-600">
            <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-slate-800 font-semibold text-sm truncate">{attempt.quizTitle}</h4>
            <p className="text-slate-400 text-xs mt-0.5">
                {attempt.subjectLabel} · {formatRelativeTime(attempt.completedAt)}
            </p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
            {Math.round(attempt.percentage)}%
        </span>
    </div>
);
