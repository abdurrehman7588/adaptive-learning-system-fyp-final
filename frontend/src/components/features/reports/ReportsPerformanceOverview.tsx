import { Award, Brain, Target, TrendingUp } from 'lucide-react';
import type { PerformanceOverview } from '../../../api/analyticsReports';

type ReportsPerformanceOverviewProps = {
    overview: PerformanceOverview;
    isLoading?: boolean;
};

export function ReportsPerformanceOverview({
    overview,
    isLoading,
}: ReportsPerformanceOverviewProps) {
    return (
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <OverviewCard
                title="Quizzes completed"
                value={isLoading ? '—' : String(overview.completedQuizzes)}
                icon={Brain}
                color="teal"
            />
            <OverviewCard
                title="Average score"
                value={isLoading ? '—' : overview.averageScore}
                icon={Award}
                color="cyan"
            />
            <OverviewCard
                title="Best subject"
                value={
                    isLoading
                        ? '—'
                        : overview.bestSubject
                          ? overview.bestSubject.label
                          : '—'
                }
                sub={
                    overview.bestSubject
                        ? `${Math.round(overview.bestSubject.averagePercent)}% avg`
                        : undefined
                }
                icon={TrendingUp}
                color="indigo"
            />
            <OverviewCard
                title="Focus area"
                value={
                    isLoading
                        ? '—'
                        : overview.focusArea
                          ? overview.focusArea.label
                          : 'Balanced'
                }
                sub={
                    overview.focusArea
                        ? `${Math.round(overview.focusArea.averagePercent)}% avg`
                        : 'No weak subject identified'
                }
                icon={Target}
                color="amber"
            />
        </div>
    );
}

function OverviewCard({
    title,
    value,
    sub,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    sub?: string;
    icon: typeof Brain;
    color: 'teal' | 'cyan' | 'indigo' | 'amber';
}) {
    const colors = {
        teal: 'text-teal-600 bg-teal-50',
        cyan: 'text-cyan-600 bg-cyan-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        amber: 'text-amber-600 bg-amber-50',
    };

    return (
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 min-h-[7rem] min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {title}
                </p>
                <p className="text-lg md:text-xl font-bold text-slate-900 mt-0.5 leading-tight break-words">
                    {value}
                </p>
                {sub && <p className="text-xs text-slate-500 mt-1 break-words">{sub}</p>}
            </div>
        </div>
    );
}
