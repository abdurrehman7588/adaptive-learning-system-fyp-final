import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { WeeklyProgressPoint } from '../../../api/analytics';
import { AlertCircle } from 'lucide-react';

type ReportsWeeklyTrendProps = {
    weeklyProgress: WeeklyProgressPoint[];
    isLoading?: boolean;
};

export function ReportsWeeklyTrend({ weeklyProgress, isLoading }: ReportsWeeklyTrendProps) {
    const chartData = weeklyProgress.map((point) => ({
        name: point.label,
        score: point.averagePercent,
        attempts: point.attempts,
    }));

    const withScores = chartData.filter((point) => point.attempts > 0);
    const weekTrend =
        withScores.length >= 2
            ? withScores[withScores.length - 1].score - withScores[withScores.length - 2].score
            : 0;
    const trendLabel =
        weekTrend > 0
            ? `+${Math.round(weekTrend)}% vs prior active day`
            : weekTrend < 0
              ? `${Math.round(weekTrend)}% vs prior active day`
              : withScores.length > 0
                ? 'Stable this week'
                : 'No activity this week';

    if (isLoading) {
        return (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Loading weekly trend...
            </div>
        );
    }

    if (!weeklyProgress.length) {
        return (
            <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-medium">No weekly data yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 text-right">{trendLabel}</p>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
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
                            formatter={(value, _name, item) => {
                                const payload = item?.payload as { attempts?: number };
                                const attempts = payload?.attempts ?? 0;
                                if (attempts === 0) {
                                    return ['No quizzes', 'Avg score'];
                                }
                                return [`${Math.round(Number(value ?? 0))}%`, 'Avg score'];
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#0d9488"
                            strokeWidth={3}
                            dot={{ fill: '#0d9488', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
