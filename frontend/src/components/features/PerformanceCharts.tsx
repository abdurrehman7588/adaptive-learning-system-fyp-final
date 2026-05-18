import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import type { SubjectStat, WeeklyProgressPoint } from '../../api/analytics';
import { Loader2 } from 'lucide-react';

type PerformanceChartsProps = {
    weeklyProgress: WeeklyProgressPoint[];
    subjectBreakdown: SubjectStat[];
    strongestSubject?: SubjectStat | null;
    isLoading?: boolean;
};

export const PerformanceCharts = ({
    weeklyProgress,
    subjectBreakdown,
    strongestSubject,
    isLoading = false,
}: PerformanceChartsProps) => {
    const weeklyData = weeklyProgress.map((point) => ({
        name: point.label,
        score: point.averagePercent,
    }));

    const subjectData = subjectBreakdown.map((subject) => ({
        name: subject.label,
        val: subject.averagePercent,
    }));

    const weekScores = weeklyData.filter((point) => point.score > 0);
    const weekTrend =
        weekScores.length >= 2
            ? weekScores[weekScores.length - 1].score - weekScores[weekScores.length - 2].score
            : 0;
    const trendLabel =
        weekTrend > 0
            ? `+${weekTrend.toFixed(0)}% vs prior day`
            : weekTrend < 0
              ? `${weekTrend.toFixed(0)}% vs prior day`
              : 'Stable this week';

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                <p className="text-sm font-medium">Loading performance data...</p>
            </div>
        );
    }

    if (!weeklyData.length && !subjectData.length) {
        return (
            <div className="p-10 text-center text-slate-500">
                <p className="font-semibold text-slate-600">No quiz data yet</p>
                <p className="text-sm mt-2">
                    Complete a quiz to see weekly progress and subject mastery charts.
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 p-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Weekly Progress
                    </h3>
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                            weekTrend >= 0
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-amber-600 bg-amber-50'
                        }`}
                    >
                        {trendLabel}
                    </span>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                                formatter={(value) => [`${Number(value ?? 0)}%`, 'Avg score']}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#0d9488"
                                strokeWidth={3}
                                dot={{ fill: '#0d9488', strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Subject Mastery
                    </h3>
                    {strongestSubject && (
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                            Top: {strongestSubject.label}
                        </span>
                    )}
                </div>
                <div className="h-[250px] w-full">
                    {subjectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    formatter={(value) => [`${Number(value ?? 0)}%`, 'Avg score']}
                                />
                                <Bar
                                    dataKey="val"
                                    fill="#0891b2"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                            No subject breakdown yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
