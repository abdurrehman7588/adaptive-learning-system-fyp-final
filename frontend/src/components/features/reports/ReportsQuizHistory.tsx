import { formatRelativeTime, type RecentAttempt } from '../../../api/analytics';
import { AlertCircle } from 'lucide-react';

type ReportsQuizHistoryProps = {
    history: RecentAttempt[];
    isLoading?: boolean;
};

export function ReportsQuizHistory({ history, isLoading }: ReportsQuizHistoryProps) {
    if (isLoading) {
        return (
            <p className="text-sm text-slate-500 py-8 text-center">Loading quiz history...</p>
        );
    }

    if (history.length === 0) {
        return (
            <div className="py-10 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-medium">No completed quizzes yet</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                        <th className="py-3 pr-4">Quiz</th>
                        <th className="py-3 pr-4">Subject</th>
                        <th className="py-3 pr-4 text-right">Score</th>
                        <th className="py-3 text-right">Completed</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((attempt) => (
                        <tr
                            key={attempt.attemptId}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                        >
                            <td className="py-3 pr-4 font-semibold text-slate-800">
                                {attempt.quizTitle}
                            </td>
                            <td className="py-3 pr-4 text-slate-600">{attempt.subjectLabel}</td>
                            <td className="py-3 pr-4 text-right">
                                <span
                                    className={`inline-block font-bold px-2 py-0.5 rounded-lg text-xs ${
                                        attempt.percentage >= 80
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : attempt.percentage >= 60
                                              ? 'bg-sky-100 text-sky-800'
                                              : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                    {Math.round(attempt.percentage)}%
                                </span>
                            </td>
                            <td className="py-3 text-right text-slate-500 whitespace-nowrap">
                                {formatRelativeTime(attempt.completedAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
