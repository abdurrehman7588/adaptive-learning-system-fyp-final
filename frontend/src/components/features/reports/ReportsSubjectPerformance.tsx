import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { SubjectStat } from '../../../api/analytics';
import { AlertCircle } from 'lucide-react';

type ReportsSubjectPerformanceProps = {
    subjects: SubjectStat[];
    isLoading?: boolean;
};

export function ReportsSubjectPerformance({ subjects, isLoading }: ReportsSubjectPerformanceProps) {
    const chartData = subjects.map((subject) => ({
        name: subject.label,
        score: Math.round(subject.averagePercent),
        attempts: subject.attempts,
    }));

    if (isLoading) {
        return (
            <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                Loading subject data...
            </div>
        );
    }

    if (subjects.length === 0) {
        return (
            <div className="h-[200px] flex flex-col items-center justify-center text-center text-slate-500 px-4">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="font-medium">No subject scores yet</p>
                <p className="text-sm mt-1">Complete quizzes to see subject performance.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="h-[260px] w-full hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            interval={0}
                            angle={chartData.length > 3 ? -20 : 0}
                            textAnchor={chartData.length > 3 ? 'end' : 'middle'}
                            height={chartData.length > 3 ? 56 : 32}
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
                            formatter={(value, _name, item) => {
                                const payload = item?.payload as { attempts?: number };
                                return [
                                    `${Number(value ?? 0)}% · ${payload?.attempts ?? 0} quiz(zes)`,
                                    'Avg score',
                                ];
                            }}
                        />
                        <Bar dataKey="score" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={36} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <ul className="space-y-3 sm:hidden">
                {subjects.map((subject) => (
                    <SubjectProgressRow key={subject.subject} subject={subject} />
                ))}
            </ul>

            <ul className="hidden sm:grid sm:grid-cols-2 gap-3">
                {subjects.map((subject) => (
                    <SubjectProgressRow key={subject.subject} subject={subject} compact />
                ))}
            </ul>
        </div>
    );
}

function SubjectProgressRow({
    subject,
    compact,
}: {
    subject: SubjectStat;
    compact?: boolean;
}) {
    const percent = Math.round(subject.averagePercent);

    return (
        <li
            className={`rounded-xl border border-slate-100 bg-slate-50/80 ${
                compact ? 'p-3' : 'p-4'
            }`}
        >
            <div className="flex justify-between items-center gap-2 mb-2">
                <span className="font-bold text-slate-800 text-sm">{subject.label}</span>
                <span className="text-sm font-black text-teal-700">{percent}%</span>
            </div>
            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{subject.attempts} completed attempt(s)</p>
        </li>
    );
}
