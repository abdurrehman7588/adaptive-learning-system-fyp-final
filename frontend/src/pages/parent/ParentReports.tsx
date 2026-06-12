import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Users } from 'lucide-react';
import {
    fetchParentAnalyticsOverview,
    getAnalyticsErrorMessage,
    type ParentAnalyticsOverview,
} from '../../api/analytics';
import { buildParentReportsViewModel, type ParentReportsViewModel } from '../../api/analyticsReports';
import { ReportsChildComparison } from '../../components/features/reports/ReportsChildComparison';
import { ReportsPerformanceOverview } from '../../components/features/reports/ReportsPerformanceOverview';
import { ReportsQuizHistory } from '../../components/features/reports/ReportsQuizHistory';
import { ReportsSubjectPerformance } from '../../components/features/reports/ReportsSubjectPerformance';
import { ReportsWeeklyTrend } from '../../components/features/reports/ReportsWeeklyTrend';
import {
    getActiveChildId,
    resolveSelectedChildIdFromList,
    setActiveChildId,
} from '../../lib/activeChild';
import { downloadReportsCsv } from '../../lib/exportReport';
import { getToken } from '../../lib/tokenStorage';
import { pageShellWide } from '../../lib/responsive';
import { cn } from '../../lib/utils';

export const ParentReports = () => {
    const [overview, setOverview] = useState<ParentAnalyticsOverview | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(() =>
        getActiveChildId(),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const loadReports = useCallback(async () => {
        if (!getToken()) {
            setOverview(null);
            setSelectedChildId(null);
            setIsLoading(false);
            setError('Sign in with your parent account to view performance reports.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchParentAnalyticsOverview();
            setOverview(data);
            setSelectedChildId((current) =>
                resolveSelectedChildIdFromList(data.children, current),
            );
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('[ParentReports] load failed', err);
            }
            setError(getAnalyticsErrorMessage(err));
            setOverview(null);
            setSelectedChildId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadReports();
    }, [loadReports]);

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === 'visible') {
                void loadReports();
            }
        };
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [loadReports]);

    const selectedChild = useMemo(
        () =>
            overview?.children.find(
                (child) => Number(child.id) === Number(selectedChildId),
            ) ?? null,
        [overview, selectedChildId],
    );

    const reports: ParentReportsViewModel | null = useMemo(() => {
        if (!selectedChild || !overview) return null;
        return buildParentReportsViewModel(selectedChild, overview.children);
    }, [selectedChild, overview]);

    const handleSelectChild = (childId: number) => {
        setSelectedChildId(childId);
        setActiveChildId(childId);
    };

    const handleExport = () => {
        if (!reports?.hasData && reports?.performanceOverview.completedQuizzes === 0) {
            return;
        }
        if (!reports) return;
        setIsExporting(true);
        try {
            downloadReportsCsv(reports);
        } finally {
            setIsExporting(false);
        }
    };

    const children = overview?.children ?? [];
    const showComparison = (reports?.multiChildComparison?.length ?? 0) > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(pageShellWide, 'space-y-6 sm:space-y-8 w-full min-w-0')}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Performance Reports</h1>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base">
                        Read-only insights from completed quiz attempts.
                        {reports?.childName ? (
                            <span className="text-slate-400"> · {reports.childName}</span>
                        ) : null}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {children.length > 1 && selectedChildId && (
                        <label className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase text-slate-500">
                                Learner
                            </span>
                            <select
                                value={selectedChildId}
                                onChange={(e) => handleSelectChild(Number(e.target.value))}
                                disabled={isLoading || Boolean(error)}
                                className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 w-full sm:w-auto sm:min-w-[10rem] max-w-full"
                            >
                                {children.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={!reports || isLoading || isExporting}
                        className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-auto min-h-11 w-full sm:w-auto"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                    <p className="font-medium text-sm">{error}</p>
                    <button
                        type="button"
                        onClick={() => void loadReports()}
                        className="text-sm font-semibold underline shrink-0"
                    >
                        Retry
                    </button>
                </div>
            )}

            {isLoading && (
                <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
                    <p className="font-medium">Loading report data...</p>
                </div>
            )}

            {!isLoading && !error && children.length === 0 && (
                <p className="text-slate-500 text-center py-12">
                    Add a learner profile to view performance reports.
                </p>
            )}

            {reports && !isLoading && (
                <>
                    <section>
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Performance overview</h2>
                        <ReportsPerformanceOverview
                            overview={reports.performanceOverview}
                            isLoading={false}
                        />
                    </section>

                    <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Subject performance</h2>
                        <ReportsSubjectPerformance subjects={reports.subjectBreakdown} />
                    </section>

                    <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Weekly progress trend</h2>
                        <p className="text-sm text-slate-500 mb-4">Last 7 days from quiz attempts</p>
                        <ReportsWeeklyTrend weeklyProgress={reports.weeklyProgress} />
                    </section>

                    <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent quiz history</h2>
                        <ReportsQuizHistory history={reports.recentHistory} />
                    </section>

                    {showComparison && reports.multiChildComparison && (
                        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                                <Users className="w-5 h-5 text-teal-600" />
                                Multi-child comparison
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Compare learners at a glance. Select a name to view their detailed
                                report.
                            </p>
                            <ReportsChildComparison
                                rows={reports.multiChildComparison}
                                selectedChildId={reports.childId}
                                onSelectChild={handleSelectChild}
                            />
                        </section>
                    )}
                </>
            )}
        </motion.div>
    );
};
