import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { PerformanceCharts } from '../../components/features/PerformanceCharts';
import {
    fetchParentAnalyticsOverview,
    formatRelativeTime,
    getAnalyticsErrorMessage,
    type ChildAnalytics,
    type RecentAttempt,
} from '../../api/analytics';
import { setActiveChildId } from '../../lib/activeChild';
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
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring' as const, stiffness: 100 },
    },
};

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
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasApiToken = Boolean(getToken());

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
            setSelectedChildId((current) => {
                if (current && overview.children.some((child) => child.id === current)) {
                    return current;
                }
                return overview.children[0]?.id ?? null;
            });
        } catch (err) {
            setError(getAnalyticsErrorMessage(err));
            setChildren([]);
            setOverviewSummary(null);
            setSelectedChildId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAnalytics();
    }, [loadAnalytics]);

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === 'visible') {
                void loadAnalytics();
            }
        };
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [loadAnalytics]);

    const selectedChild = useMemo(
        () => children.find((child) => child.id === selectedChildId) ?? null,
        [children, selectedChildId],
    );

    const handleChildChange = (childId: number) => {
        setSelectedChildId(childId);
        setActiveChildId(childId);
    };

    const summary = selectedChild?.summary;
    const strongest = summary?.strongestSubject;
    const weakest = summary?.weakestSubject;

    const completedCount =
        summary?.completedAttempts ?? overviewSummary?.completedAttempts ?? 0;
    const totalAttempts =
        summary?.totalAttempts ?? overviewSummary?.totalAttempts ?? 0;
    const averageScorePercent =
        summary?.averageScorePercent ?? overviewSummary?.averageScorePercent ?? 0;

    return (
        <motion.div
            className="space-y-8 p-6 lg:p-10 min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none" />

            <motion.header
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10"
            >
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0] || 'Parent'}! 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Track quiz performance and learning progress from completed attempts.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {children.length > 1 && selectedChildId && (
                        <select
                            value={selectedChildId}
                            onChange={(event) => handleChildChange(Number(event.target.value))}
                            className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.name}
                                    {child.gradeLevel ? ` · ${child.gradeLevel}` : ''}
                                </option>
                            ))}
                        </select>
                    )}
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 text-center">
                        Today,{' '}
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </motion.header>

            {!hasApiToken && !error && (
                <motion.div
                    variants={itemVariants}
                    className="relative z-10 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-5 py-4"
                >
                    <p className="font-medium">
                        Quiz results are stored on the server only after API parent sign-in. Use{' '}
                        <Link to="/parent/login" className="underline font-semibold">
                            Parent Login
                        </Link>{' '}
                        (demo: parent@demo.com / password123).
                    </p>
                </motion.div>
            )}

            {error && (
                <motion.div
                    variants={itemVariants}
                    className="relative z-10 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                >
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

            <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6 relative z-10">
                <StatsCard
                    title="Quizzes Completed"
                    value={isLoading ? '—' : String(completedCount)}
                    trend={
                        isLoading
                            ? 'Loading...'
                            : `${totalAttempts} total attempts`
                    }
                    icon={Brain}
                    color="violet"
                    trendColor="text-slate-500"
                />
                <StatsCard
                    title="Average Score"
                    value={
                        isLoading
                            ? '—'
                            : `${Math.round(averageScorePercent)}%`
                    }
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
                    title="Focus Area"
                    value={
                        isLoading
                            ? '—'
                            : weakest && weakest.subject !== strongest?.subject
                              ? weakest.label
                              : 'Balanced'
                    }
                    trend={
                        weakest && weakest.subject !== strongest?.subject
                            ? `${Math.round(weakest.averagePercent)}% avg · needs practice`
                            : 'No weak subject identified yet'
                    }
                    icon={Target}
                    color="emerald"
                    trendColor="text-amber-600"
                />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
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
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
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
                </motion.div>
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
};

const StatsCard = ({ title, value, trend, icon: Icon, color, trendColor }: StatsCardProps) => {
    const colorClasses: Record<StatsCardProps['color'], string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        violet: 'bg-violet-50 text-violet-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                </div>
            </div>
            <div>
                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    {title}
                </h3>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
                <p className={`text-sm mt-2 font-medium ${trendColor}`}>{trend}</p>
            </div>
        </motion.div>
    );
};

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
